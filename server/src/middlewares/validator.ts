import { Context, Request } from 'koa'
import { ClassType } from 'class-transformer/ClassTransformer'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import * as createError from 'http-errors'

export default function validatorMiddleware<T>(
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
