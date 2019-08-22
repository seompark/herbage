import * as Router from 'koa-router'
import * as createError from 'http-errors'

import { createApp } from '../../common'
import Post, { PostStatus, PostPublicFields } from '../../models/Post'
import Verifier from '../../models/Verifier'
import authMiddleware from '../../middlewares/auth'
import validatorMiddleware from '../../middlewares/validator'
import { RequestQuery, NewPost, EditPost } from './types'

const router = new Router()

router.get(
  '/',
  validatorMiddleware(RequestQuery, { where: 'query' }),
  authMiddleware(),
  async (ctx): Promise<void> => {
    const data = ctx.validator.data as RequestQuery

    if (ctx.header.authorization && !ctx.isAdmin) {
      throw new createError.Unauthorized()
    }

    const posts = await Post.getList(data.count, data.cursor, {
      admin: ctx.isAdmin,
      condition: ctx.isAdmin && {
        status: data.status
      }
    })

    ctx.status = 200
    ctx.body = {
      posts: ctx.isAdmin
        ? posts.map((v): Record<keyof typeof v, unknown> => v.toJSON())
        : posts.map((v): PostPublicFields => v.getPublicFields()),
      cursor:
        posts.length > 0
          ? ctx.isAdmin
            ? posts[posts.length - 1].cursorId
            : posts[posts.length - 1].number
          : null,
      hasNext: posts.length === data.count
    }
  }
)

router.get(
  '/:id',
  async (ctx): Promise<void> => {
    const post = await Post.findOne({ hash: ctx.params.id })

    if (!post) throw new createError.NotFound()

    ctx.status = 200
    ctx.body = post
  }
)

router.post(
  '/',
  validatorMiddleware(NewPost),
  async (ctx): Promise<void> => {
    const body = ctx.validator.data as NewPost
    const verifier = await Verifier.findOne({
      _id: Base64.decode(body.verifier.id)
    }).exec()

    if (!verifier || !verifier.isCorrect(body.verifier.answer)) {
      throw new createError.UnavailableForLegalReasons() // HTTP 451
    }

    const result = await new Post({
      title: body.title,
      content: body.content,
      tag: body.tag
    }).save()

    // https://stackoverflow.com/questions/19199872/best-practice-for-restful-post-response
    ctx.status = 201
    ctx.set('Location', `/api/posts/${result.id}`)
    ctx.body = result.getAuthorFields()
  }
)

router.patch(
  '/:id',
  authMiddleware({ continue: false }),
  validatorMiddleware(EditPost),
  async (ctx): Promise<void> => {
    const body = ctx.validator.data as EditPost

    let result

    const post = await Post.findById(ctx.params.id)
    if (!post) throw new createError.NotFound()

    if (body.status) {
      if (body.status === 'ACCEPTED' && post.status === 'ACCEPTED')
        throw new createError.UnavailableForLegalReasons()
      switch (body.status) {
        case PostStatus.Accepted:
          if (!body.fbLink) throw new createError.BadRequest()
          result = await post.setAccepted(body.fbLink)
          break
        case PostStatus.Rejected:
          if (!body.reason) throw new createError.BadRequest()
          result = await post.setRejected(body.reason)
          break
        default:
          throw new createError.BadRequest()
      }
    } else {
      if (!body.content) throw new createError.BadRequest()
      result = await post.edit(body.content)
    }
    ctx.status = 200
    ctx.body = result.toJSON()
  }
)

router.delete(
  '/:arg',
  authMiddleware(),
  async (ctx): Promise<void> => {
    const post = ctx.isAdmin
      ? await Post.findById(ctx.params.arg)
      : await Post.findOne({ hash: ctx.params.arg })
    if (!post) throw new createError.NotFound()

    ctx.isAdmin ? await post.remove() : await post.setDeleted()

    ctx.status = 200
  }
)

router.get(
  '/new-number',
  async (ctx): Promise<void> => {
    const newNumber =
      ((await Post.find()
        .sort({ number: -1 })
        .limit(1)
        .exec())[0].number || 0) + 1
    ctx.status = 200
    ctx.body = { newNumber }
  }
)

export default createApp('/posts', router)
