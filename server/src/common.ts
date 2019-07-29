import * as Koa from 'koa'
import * as logger from 'koa-logger'
import * as bodyParser from 'koa-bodyparser'
import * as json from 'koa-json'
import * as Router from 'koa-router'
import * as mongoose from 'mongoose'
import { IncomingMessage, ServerResponse } from 'http'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
const conditional = require('koa-conditional-get') // eslint-disable-line
const etag = require('koa-etag') // eslint-disable-line

mongoose
  .connect(process.env.MONGO_HOST || '', {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then((): void => console.log('MongoDB connected'))
  .catch((err: Error): void => console.log('Failed to connect MongoDB: ', err))

export function createApp(
  routerPath: string,
  router: Router
): (
  req: IncomingMessage | Http2ServerRequest,
  res: ServerResponse | Http2ServerResponse
) => void {
  const app = new Koa()
  const rootRouter = new Router()

  app.use(json())
  app.use(conditional())
  app.use(etag())
  app.use(logger())
  app.use(bodyParser())

  app.use(
    async (ctx, next): Promise<void> => {
      try {
        await next()
        if (ctx.status >= 400) {
          ctx.throw(ctx.status, ctx.message)
        }
      } catch (err) {
        if (err.status) {
          ctx.status = err.status
          ctx.body = {
            error: err.message
          }
        } else {
          ctx.status = 500
          ctx.body = {
            error: 'Internal Server Error'
          }
          console.error(err)
          // TODO log error
        }
      }
    }
  )

  rootRouter.use('/api' + routerPath, router.routes(), router.allowedMethods())
  app.use(rootRouter.routes()).use(rootRouter.allowedMethods())

  return app.callback()
}
