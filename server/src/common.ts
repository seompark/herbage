import * as Koa from 'koa'
import * as logger from 'koa-logger'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import * as mongoose from 'mongoose'

mongoose.connect(process.env.MONGO_HOST || '', {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true
}).then(() => console.log('MongoDB connected'))
  .catch((err: Error) => console.log('Failed to connect MongoDB: ', err))

export function createApp(routerPath: string, router: Router) {
  const app = new Koa()
  const rootRouter = new Router()

  app.use(logger())
  app.use(bodyParser())

  app.use(async (ctx, next) => {
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
  })

  rootRouter.use('/api' + routerPath, router.routes(), router.allowedMethods())
  app.use(rootRouter.routes()).use(rootRouter.allowedMethods())

  return app.callback()
}
