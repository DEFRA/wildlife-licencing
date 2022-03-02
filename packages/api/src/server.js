import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import { SERVER_PORT } from './constants.js'
import {
  getUserByUserId,
  getUsers,
  deleteUser,
  postUser
} from './handlers/user/user.js'

import {
  getSitesByUserId,
  getSiteBySiteId,
  postSite,
  putSite,
  deleteSite
} from './handlers/site/site.js'

import {
  getApplicationByApplicationId,
  getApplicationsByUserId,
  postApplication,
  putApplication,
  deleteApplication,
  postApplicationSubmit,
  getApplicationReference
} from './handlers/application/application.js'

import {
  getApplicationSitesByUserId,
  getApplicationSiteByApplicationSiteId,
  deleteApplicationSiteByApplicationSiteId,
  postApplicationSite
} from './handlers/application-site/application-site.js'

import {
  getApplicationApplicant,
  putApplicationApplicant,
  deleteApplicationApplicant
} from './handlers/application/applicant/applicant.js'

import {
  getApplicationEcologist,
  putApplicationEcologist,
  deleteApplicationEcologist
} from './handlers/application/ecologist/ecologist.js'

import {
  getApplicationEligibility,
  putApplicationEligibility,
  deleteApplicationEligibility
} from './handlers/application/eligibility/eligibility.js'

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
  getUserByUserId,
  getUsers,
  postUser,
  deleteUser,
  getSitesByUserId,
  getSiteBySiteId,
  postSite,
  putSite,
  deleteSite,
  getApplicationByApplicationId,
  getApplicationsByUserId,
  postApplication,
  putApplication,
  deleteApplication,
  getApplicationReference,
  getApplicationApplicant,
  putApplicationApplicant,
  deleteApplicationApplicant,
  getApplicationEcologist,
  putApplicationEcologist,
  deleteApplicationEcologist,
  getApplicationEligibility,
  putApplicationEligibility,
  deleteApplicationEligibility,
  postApplicationSubmit,
  getApplicationSitesByUserId,
  getApplicationSiteByApplicationSiteId,
  deleteApplicationSiteByApplicationSiteId,
  postApplicationSite,
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
