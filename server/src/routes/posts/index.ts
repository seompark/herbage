import { Context, Request } from 'koa'
import * as Router from 'koa-router'

import { createApp } from '../../common'
import Post, { PostStatus } from '../../models/Post'
import Verifier from '../../models/Verifier'
import { plainToClass, Type, Transform, Expose } from 'class-transformer'
import { ClassType } from 'class-transformer/ClassTransformer'
import { validate, IsInt, IsBase64, IsOptional, IsString, ValidateNested, MinLength, Length } from 'class-validator'
import * as createError from 'http-errors'

class RequestQuery {
  @Expose()
  @Transform(value => parseInt(value, 10))
  @IsInt()
  count: number

  @Expose()
  @IsOptional()
  @IsBase64()
  cursor?: string
}

class RequestVerifySchema {
  @Expose()
  @IsBase64()
  id: string

  @Expose()
  @IsString()
  answer: string
}

class NewPost {
  @Expose()
  @IsString()
  @IsOptional()
  title?: string

  @Expose()
  @IsString()
  @Length(1, 3000)
  content: string

  @Expose()
  @IsString()
  @MinLength(1)
  tag: string

  @Expose()
  @Type(() => RequestVerifySchema)
  @ValidateNested()
  verifier: RequestVerifySchema
}

class EditPost {
  @Expose()
  @IsString()
  @IsOptional()
  content?: string

  @Expose()
  @IsString()
  @IsOptional()
  status?: string

  @Expose()
  @IsString()
  @IsOptional()
  fbLink?: string
}

const router = new Router()

function validatorMiddleware<T>(
  schema: ClassType<T>,
  options: { where: keyof Request } = { where: 'body' }
) {
  return async (ctx: Context, next: () => Promise<any>) => {
    const data = plainToClass(schema, ctx.request[options.where], {
      excludeExtraneousValues: true
    })
    const errors = await validate(data)

    console.log(data, ctx.request[options.where])

    ctx.validator = {
      data,
      errors
    }

    if (errors.length > 0) {
      throw new createError.BadRequest()
    }

    await next()
  }
}

/**
 * if options.continue is true, even if client isn't an admin,
 * it will just call next function with accessable ctx.isAdmin to recognize whether client is an admin.
 *
 * @param options
 */
function authMiddleware(options: { continue: boolean } = { continue: true }) {
  return async (ctx: Context, next: () => Promise<any>) => {
    if (!ctx.header.authorization) {
      if (options.continue) {
        ctx.isAdmin = false
        await next()
        return
      } else throw new createError.Unauthorized()
    }
    ctx.isAdmin = Base64.decode(ctx.header.authorization.replace('Basic ', '')) === process.env.ADMIN_PASSWORD
    if (!ctx.isAdmin && !options.continue) throw new createError.Unauthorized()

    await next()
  }
}

router.get('/', validatorMiddleware(RequestQuery, { where: 'query' }), authMiddleware(), async ctx => {
  const data = ctx.validator.data as RequestQuery

  const isAdmin = ctx.header.authorization === process.env.ADMIN_PASSWORD
  if (ctx.header.authorization && !isAdmin) throw new createError.Unauthorized()

  const posts = await Post.getList(data.count, data.cursor, { admin: ctx.isAdmin })

  ctx.status = 200
  ctx.body = {
    posts: posts.map(v => v.getPublicFields()),
    cursor: posts.length > 0 ? posts[posts.length - 1].cursorId : null,
    hasNext: posts.length === data.count
  }
})

router.post('/', validatorMiddleware(NewPost), async ctx => {
  const body = ctx.validator.data as NewPost
  const verifier = await Verifier.findOne({ _id: Base64.decode(body.verifier.id) }).exec()

  if (!verifier || !verifier.isCorrect(body.verifier.answer)) {
    throw new createError.UnavailableForLegalReasons() // HTTP 451
  }

  const result = await new Post({
    title: body.title,
    content: body.content
  }).save()

  // https://stackoverflow.com/questions/19199872/best-practice-for-restful-post-response
  ctx.status = 201
  ctx.header['Location'] = '/api/posts/' + result.number
  ctx.body = result.getPublicFields()
})

router.patch('/:id', authMiddleware({ continue: false }), validatorMiddleware(EditPost), async ctx => {
  const body = ctx.validator.data as EditPost

  if (body.status) {
    const post = await Post.findOne({ id: ctx.params.id }).exec()
    if (!post) throw new createError.NotFound()

    switch (body.status) {
      case PostStatus.Accepted:
        if (!body.fbLink) throw new createError.BadRequest()
        await post.setAccepted(body.fbLink)
        break
      case PostStatus.Declined:
        await post.setDeclined()
        break
      default:
        throw new createError.BadRequest()
    }
  } else {
    const result = await Post.updateOne({ _id: ctx.params.id }, body, {
      runValidators: true,
      sort: {
        _id: 1
      }
    }).exec()

    ctx.body = result.getPublicFields()
  }

})

export default createApp('/posts', router)
