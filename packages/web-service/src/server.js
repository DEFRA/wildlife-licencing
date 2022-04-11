import 'dotenv/config'
import Hapi from '@hapi/hapi'
import HapiInert from '@hapi/inert'
import HapiVision from '@hapi/vision'
import find from 'find'
import Nunjucks from 'nunjucks'
import path from 'path'
import __dirname from '../dirname.cjs'
import routes from './routes/routes.js'
import { SESSION_TTL_MS_DEFAULT, SESSION_COOKIE_NAME_DEFAULT } from './constants.js'
import sessionManager from './session-cache/session-manager.js'
import cacheDecorator from './session-cache/cache-decorator.js'
import scheme from './services/authorization.js'
import { REGISTER, eligibilityURIs } from './uris.js'

const getSessionCookieName = () => process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME_DEFAULT

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

const additionalPageData = (request, h) => {
  const response = request.response
  if (request.method === 'get' && response.variety === 'view') {
    Object.assign(response.source.context, {
      _uri: {
        register: REGISTER.uri,
        landowner: eligibilityURIs.LANDOWNER.uri,
        landownerPermission: eligibilityURIs.LANDOWNER_PERMISSION.uri,
        consent: eligibilityURIs.CONSENT.uri,
        consentGranted: eligibilityURIs.CONSENT_GRANTED.uri
      },
      credentials: request.auth.credentials
    })
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
 * Need to add the 400 and 500 error pages, for now log it
 * @param request
 * @param h
 * @returns {string|((key?: IDBValidKey) => void)|*}
 */
const errorHandler = (request, h) => {
  if (request.response.isBoom) {
    console.error('Error processing request. Request: %j, Exception: %o', request, request.response)
  }
  return h.continue
}

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {
  const pagesViewPaths = [...new Set(find.fileSync(/\.njk$/, path.join(__dirname, './src/pages')).map(f => path.dirname(f)))]

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
  server.state(sessionCookieName, sessionCookieOptions)
  server.ext('onPreHandler', sessionManager(sessionCookieName))
  server.decorate('request', 'cache', cacheDecorator(sessionCookieName))

  // Set authentication up
  server.auth.scheme('session-cache', scheme)
  server.auth.strategy('default', 'session-cache')
  server.auth.default('default')

  // Add additional data used by all pages
  server.ext('onPreResponse', additionalPageData)

  // Register the dynamic routes
  await server.route(routes)

  // Log any errors
  server.ext('onPreResponse', errorHandler)

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
