import 'dotenv/config'
import Hapi from '@hapi/hapi'
import find from 'find'
import Nunjucks from 'nunjucks'
import path from 'path'
import { __dirname } from '../dirname.cjs'
import routes from './routes/routes.js'
import { SESSION_COOKIE_NAME_DEFAULT, SESSION_TTL_MS_DEFAULT } from './constants.js'
import sessionManager, { isStaticResource } from './session-cache/session-manager.js'
import cacheDecorator from './session-cache/cache-decorator.js'
import scheme from './services/authorization.js'
import { errorHandler } from './handlers/error-handler.js'
import { additionalPageData, addCookiePrefs } from './additional-page-data.js'
import db from 'debug'
import { plugins } from './plugins.js'
const debug = db('web-service:server')

const getSessionCookieName = () => process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME_DEFAULT

/**
 * Create the hapi server. Exported for unit testing purposes
 * @returns {Promise<*>}
 */
const createServer = async () => {
  const server = new Hapi.Server({
    port: process.env.SERVER_PORT || 4000,
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'public')
      }
    }
  })
  debug(`Created server :${JSON.stringify(server.info, null, 4)}`)

  return server
}

// Add default headers
export const addDefaultHeaders = (request, h) => {
  if (!request.response.isBoom) {
    if (!isStaticResource(request)) {
      request.response.header('X-Frame-Options', 'DENY')
      request.response.header('Cache-Control', 'no-store')
      request.response.header('X-XSS-Protection', '1; mode=block')
    }
    request.response.header('X-Content-Type-Options', 'nosniff')
    request.response.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  return h.continue
}

const GOVUK_FRONTEND = 'govuk-frontend'
const sessionCookieOptions = {
  ttl: process.env.SESSION_TTL_MS || SESSION_TTL_MS_DEFAULT, // Will be kept alive on each request
  isSecure: process.env.NODE_ENV !== 'development',
  isHttpOnly: process.env.NODE_ENV !== 'development',
  isSameSite: 'Strict',
  encoding: 'iron',
  password: process.env.SESSION_COOKIE_PASSWORD,
  clearInvalid: true,
  strictHeader: true,
  path: '/'
}

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {
  const pagesViewPaths = [...new Set(find.fileSync(/\.njk$/, path.join(__dirname, './src/pages')).map(f => path.dirname(f)))]

  await server.register(plugins)

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
      path.join(__dirname, 'node_modules', GOVUK_FRONTEND),
      path.join(__dirname, 'node_modules', GOVUK_FRONTEND, 'govuk'),
      path.join(__dirname, 'node_modules', GOVUK_FRONTEND, 'govuk', 'components'),
      path.join(__dirname, 'src/pages/layout'),
      path.join(__dirname, 'src/pages/macros'),
      ...pagesViewPaths
    ]
  })

  const sessionCookieName = getSessionCookieName()

  // Set up the session cookie
  debug(`Session cookie name: ${sessionCookieName}`)
  server.state(sessionCookieName, sessionCookieOptions)
  server.ext('onPreAuth', sessionManager(sessionCookieName))
  server.decorate('request', 'cache', cacheDecorator(sessionCookieName))

  // Set authentication up
  server.auth.scheme('session-cache', scheme)
  server.auth.strategy('default', 'session-cache')
  server.auth.default('default')

  // Add additional data used by all pages
  server.ext('onPreResponse', additionalPageData)
  server.ext('onPreResponse', addDefaultHeaders)
  server.ext('onPreResponse', addCookiePrefs)

  // Register the dynamic routes
  await server.route(routes)

  // Log any errors
  if (!process.env.NO_ERROR_ROUTE) {
    server.ext('onPreResponse', errorHandler)
  }

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
