import * as Router from 'koa-router'
import * as createError from 'http-errors'
import { sign } from 'jsonwebtoken'

import { createApp } from '../../common'
import validatorMiddelware from '../../middlewares/validator'
import { RequestToken } from './types'

const router = new Router()

router.post(
  '/',
  validatorMiddelware(RequestToken),
  async (ctx): Promise<void> => {
    const body = ctx.request.body as RequestToken
    if (body.password !== process.env.ADMIN_PASSWORD) {
      throw new createError.Unauthorized()
    }

    const token = sign({ name: '관리자' }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '3h'
    })

    ctx.body = {
      token
    }
  }
)

export default createApp('/a1p4ca', router)
