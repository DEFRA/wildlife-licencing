import 'dotenv/config'
import CatboxRedis from '@hapi/catbox-redis'
import Hapi from '@hapi/hapi'
import HapiInert from '@hapi/inert'
import HapiVision from '@hapi/vision'
import find from 'find'
import Nunjucks from 'nunjucks'
import path from 'path'
import __dirname from '../dirname.cjs'
import routes from './routes/routes.js'

/**
 * Create the hapi server. Exported for unit testing purposes
 * @returns {Promise<*>}
 */
const createServer = async () => {
  return new Hapi.Server({
    port: process.env.SERVER_PORT || 4000,
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'public')
      }
    }
  })
}

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {
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
        path: path.join(__dirname, 'public')
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
