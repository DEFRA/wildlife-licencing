import Path from 'path'
import Hapi from '@hapi/hapi'
import HapiVision from '@hapi/vision'
import HapiInert from '@hapi/inert'
import routes from './routes/routes.js'
import { SERVER_PORT } from './constants.js'
import viewEngine from './lib/view-engine/index.js'
import lodash from 'lodash'
import CatboxRedis from '@hapi/catbox-redis'
import find from 'find'
import path from 'path'
import Nunjucks from 'nunjucks'

/**
 * Create the hapi server. Exported for unit testing purposes
 * @returns {Promise<*>}
 */
const createServer = async () => {
  const __dirname = Path.resolve()
  return new Hapi.Server({
    port: SERVER_PORT,
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    },
    cache: [
      {
        provider: {
          constructor: CatboxRedis,
          options: {
            partition: 'web-service',
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            db: 0
          }
        }
      }
    ]
  })
}

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {
  const __dirname = Path.resolve()

  const pagesViewPaths = [...new Set(find.fileSync(/\.njk$/, path.join(__dirname, './src/pages')).map(f => path.dirname(f)))]
  const commonViewPaths = [...new Set(find.fileSync(/\.njk$/, path.join(__dirname, './src/views')).map(f => path.dirname(f)))]

  await server.route(routes)

  await server.register(HapiVision)
  await server.register(HapiInert)
  await server.views({
    engines: {
      njk: {
        compile: (src, options) => {
          const template = Nunjucks.compile(src, options.environment)
          return context => template.render(context)
        },
        prepare: (options, next) => {
          options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false })
          return next()
        }
      }
    },

    relativeTo: __dirname,
    isCached: process.env.NODE_ENV !== 'development',

    path: [
      path.join(__dirname, 'node_modules', 'govuk-frontend'),
      ...commonViewPaths,
      ...pagesViewPaths
    ]
  })

  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public')
      }
    }
  })
  /*
   * Set up shutdown handlers
   */
  const shutdown = async code => {
    console.log(`Web server is shutdown with ${code}`)
    await server.stop()
    process.exit(code)
  }

  process.on('SIGINT', () => shutdown(130))
  process.on('SIGTERM', () => shutdown(137))

  /*
   * Start the server
   */
  try {
    await server.start()
    console.log('Server running at:', server.info.uri)
  } catch (err) {
    console.log(err)
  }
}

export { init, createServer }
