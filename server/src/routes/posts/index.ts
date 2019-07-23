import * as Router from 'koa-router'
import * as createError from 'http-errors'

import { createApp } from '../../common'
import Post, { PostStatus } from '../../models/Post'
import Verifier from '../../models/Verifier'
import authMiddleware from '../../middlewares/auth'
import validatorMiddleware from '../../middlewares/validator'
import { RequestQuery, NewPost, EditPost } from './types'

const router = new Router()

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
