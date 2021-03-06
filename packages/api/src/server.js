import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import { SERVER_PORT } from './constants.js'
import db from 'debug'

import {
  getUserByUserId,
  getUsers,
  deleteUser,
  postUser
} from './handlers/user/user.js'

import {
  getContacts,
  postContact,
  getContactByContactId,
  putContact,
  deleteContact
} from './handlers/contact/contact.js'

import {
  getAccounts,
  postAccount,
  getAccountByAccountId,
  putAccount,
  deleteAccount
} from './handlers/account/account.js'

import {
  getApplicationContacts,
  postApplicationContact,
  putApplicationContactById,
  getApplicationContactById,
  deleteApplicationContactById
} from './handlers/application-contact/application-contact.js'

import {
  getApplicationAccounts,
  postApplicationAccount,
  getApplicationAccountById,
  putApplicationAccountById,
  deleteApplicationAccountById
} from './handlers/application-account/application-account.js'

import {
  getSiteBySiteId,
  postSite,
  putSite,
  deleteSite,
  getSites
} from './handlers/site/site.js'

import {
  getApplicationByApplicationId,
  getApplications,
  postApplication,
  putApplication,
  deleteApplication,
  postApplicationSubmit,
  getApplicationReference
} from './handlers/application/application.js'

import {
  getApplicationUsers,
  postApplicationUser,
  getApplicationUserById,
  deleteApplicationUserById
} from './handlers/application-user/application-user.js'

import {
  getApplicationSites,
  getApplicationSiteByApplicationSiteId,
  deleteApplicationSiteByApplicationSiteId,
  postApplicationSite
} from './handlers/application-site/application-site.js'

import {
  getApplicationEligibility,
  putApplicationEligibility,
  deleteApplicationEligibility
} from './handlers/application/eligibility/eligibility.js'

import {
  postHabitatSite,
  getHabitatSiteByHabitatSiteId,
  getHabitatSitesByApplicationId,
  putHabitatSite,
  deleteHabitatSite
} from './handlers/habitat-site/habitat-site.js'

import {
  getApplicationTypes,
  getApplicationPurposes
} from './handlers/reference-data/reference-data.js'

import { getOptionSets } from './handlers/reference-data/option-sets.js'

import validationFail from './handlers/validation-fail.js'
import notFound from './handlers/not-found.js'
import postResponseHandler from './handlers/post-response-handler.js'

/**
 * Create the hapi server. Exported for unit testing purposes
 * @returns {Promise<*>}
 */
const createServer = async () => new Hapi.Server({ port: SERVER_PORT })

// Split out to comply with sonar-cube line restriction on functions
const handlers = {
  // User handlers
  getUserByUserId,
  getUsers,
  postUser,
  deleteUser,

  // Contact handlers
  getContacts,
  postContact,
  getContactByContactId,
  putContact,
  deleteContact,

  // account handlers
  getAccounts,
  postAccount,
  getAccountByAccountId,
  putAccount,
  deleteAccount,

  // application-contact handlers
  getApplicationContacts,
  postApplicationContact,
  getApplicationContactById,
  putApplicationContactById,
  deleteApplicationContactById,

  // application account handlers
  getApplicationAccounts,
  postApplicationAccount,
  getApplicationAccountById,
  putApplicationAccountById,
  deleteApplicationAccountById,

  // Site handlers
  getSiteBySiteId,
  getSites,
  postSite,
  putSite,
  deleteSite,

  // Application handlers
  getApplicationByApplicationId,
  getApplications,
  postApplication,
  putApplication,
  deleteApplication,
  getApplicationReference,
  getApplicationEligibility,
  putApplicationEligibility,
  deleteApplicationEligibility,
  postApplicationSubmit,

  // Application-user handlers
  getApplicationUsers,
  postApplicationUser,
  getApplicationUserById,
  deleteApplicationUserById,

  // Application site handlers
  getApplicationSites,
  getApplicationSiteByApplicationSiteId,
  deleteApplicationSiteByApplicationSiteId,
  postApplicationSite,

  // Habitat site handlers
  postHabitatSite,
  getHabitatSiteByHabitatSiteId,
  getHabitatSitesByApplicationId,
  putHabitatSite,
  deleteHabitatSite,

  // Miscellaneous handlers
  getApplicationTypes,
  getApplicationPurposes,
  getOptionSets,
  validationFail,
  notFound,
  postResponseHandler
}

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {
  const { OpenAPIBackend } = await import('openapi-backend')

  /*
   * Create the OpenAPI backend
   */
  const api = new OpenAPIBackend({ definition: 'openapi/licence.yaml' })

  /*
   * Register the openapi/hapi route handler mappings
   */
  api.register(handlers)

  /*
   * Initialize OpenAPI backend
   */
  await api.init()

  /*
   * For debugging only
   */
  server.ext('onPreHandler', (request, h) => {
    const debug = db('api:request')
    const info = {
      method: request.method,
      path: request.path,
      query: request.query,
      headers: request.headers,
      payload: request.payload
    }
    debug(info)
    return h.continue
  })

  /*
   * Direct the generic hapi route handler to the openapi backend
   */
  server.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    path: '/{path*}',
    handler (req, h) {
      return api.handleRequest(
        {
          method: req.method,
          path: req.path,
          body: req.payload,
          query: req.query,
          headers: req.headers
        },
        req,
        h
      )
    }
  })

  /*
   * Register Inert to server up the swagger-ui documentation
   */
  await server.register([Inert])

  server.route({
    method: 'GET',
    path: '/openapi-ui/{param*}',
    handler: {
      directory: {
        path: './dist',
        index: ['index.html']
      }
    }
  })

  /*
   * Set up shutdown handlers
   */
  const shutdown = async code => {
    console.log(`API server is shutdown with ${code}`)
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
