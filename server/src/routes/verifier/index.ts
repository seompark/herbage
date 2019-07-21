import * as createError from 'http-errors'
import { Base64 } from 'js-base64'
import * as Router from 'koa-router'
import { createApp } from '../../common'
import Verifier from '../../models/Verifier'

const router = new Router()

router.get('/', async ctx => {
  const count = await Verifier.count({}).exec()
  const random = Math.floor(Math.random() * count)
  const result = await Verifier.findOne().skip(random).exec()

  if (!result) throw new createError.NotFound()

  ctx.body = {
    id: Base64.encode(result._id),
    question: result.question
  }
})

export default createApp('/verifier', router)
