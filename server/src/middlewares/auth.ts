import { Context } from 'koa'
import * as createError from 'http-errors'

/**
 * if options.continue is true, even if client isn't an admin,
 * it will just call next function with accessable ctx.isAdmin to recognize whether client is an admin.
 *
 * @param options
 */
export default function authMiddleware(options: { continue: boolean } = { continue: true }) {
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
