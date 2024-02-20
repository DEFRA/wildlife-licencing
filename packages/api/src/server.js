import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import { SERVER_PORT } from './constants.js'
import db from 'debug'
import * as winston from 'winston'

import {
  getUserByUserId,
  getUsers,
  deleteUser,
  postUser,
  putUser,
  postUserUpdateSubmit
} from './handlers/user/user.js'

import {
  getOrganisationById,
  putOrganisation,
  postOrganisationUpdateSubmit
} from './handlers/organisation/organisation.js'

import {
  getUserOrganisationById,
  putUserOrganisation
} from './handlers/user-organisation/user-organisation.js'

import {
  getContacts,
  postContact,
  getContactByContactId,
  getContactsByUserId,
  putContact,
  deleteContact,
  userContactsHelper
} from './handlers/contact/contact.js'

import {
  getAccounts,
  postAccount,
  getAccountByAccountId,
  getAccountsByOrganisationId,
  putAccount,
  deleteAccount,
  userAccountsHelper
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
  getApplicationLicences,
  postLicenceResendSubmit
} from './handlers/licence/licence.js'

import {
  postReturn,
  getReturnsByLicenceId,
  getReturn,
  putReturn,
  deleteReturn,
  postReturnSubmit
} from './handlers/return/return.js'

import {
  getPreviousLicences,
  postPreviousLicence,
  getPreviousLicence,
  putPreviousLicence,
  deletePreviousLicence
} from './handlers/previous-licence/previous-licence.js'

import {
  getApplicationFileUploads,
  postApplicationFileUpload,
  getApplicationFileUpload,
  putApplicationFileUpload,
  deleteApplicationFileUploadByUploadId
} from './handlers/application-file-upload/application-file-upload.js'

import {
  getReturnFileUploads,
  postReturnFileUpload,
  getReturnFileUpload,
  putReturnFileUpload,
  deleteReturnFileUploadByUploadId
} from './handlers/return-file-upload/return-file-upload.js'

import {
  getSiteBySiteId,
  postSite,
  putSite,
  deleteSite,
  getSites,
  userSitesHelper
} from './handlers/site/site.js'

import {
  getEcologistExperience,
  putEcologistExperience,
  deleteEcologistExperience
} from './handlers/application/ecologist-experience/ecologist-experience.js'

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
  getPermissionsSection,
  putPermissionsSection,
  deletePermissionsSection
} from './handlers/application/permissions-section/permissions-sections.js'

import {
  postPermission,
  getPermissions,
  getPermission,
  putPermission,
  deletePermission
} from './handlers/permission/permission.js'

import {
  postApplicationDesignatedSite,
  putApplicationDesignatedSite,
  getApplicationDesignatedSite,
  getApplicationDesignatedSites,
  deleteApplicationDesignatedSite
} from './handlers/application-designated-site/application-designated-site.js'

import {
  postHabitatSite,
  getHabitatSiteByHabitatSiteId,
  getHabitatSitesByApplicationId,
  getHabitatSitesByLicenceId,
  putHabitatSite,
  deleteHabitatSite
} from './handlers/habitat-site/habitat-site.js'

import {
  getApplicationTypes,
  getApplicationPurposes,
  getAuthorities,
  getDesignatedSites
} from './handlers/reference-data/reference-data.js'

import {
  postFeedback
} from './handlers/feedback/feedback.js'

import { findApplicationTypes } from './handlers/reference-data/find-application-types.js'

import { getOptionSets } from './handlers/reference-data/option-sets.js'
import validationFail from './handlers/validation-fail.js'
import notFound from './handlers/not-found.js'
import postResponseHandler from './handlers/post-response-handler.js'
import postResetHandler from './handlers/reset.js'

// Using Winston we can send our logs anywhere we like, but for now we'll just log to the console
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
})

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
  putUser,
  deleteUser,
  getOrganisationById,
  putOrganisation,
  getUserOrganisationById,
  putUserOrganisation,

  // Contact handlers
  getContacts,
  postContact,
  getContactByContactId,
  getContactsByUserId,
  putContact,
  deleteContact,
  userContactsHelper,

  // account handlers
  getAccounts,
  postAccount,
  getAccountByAccountId,
  getAccountsByOrganisationId,
  putAccount,
  deleteAccount,
  userAccountsHelper,

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
  userSitesHelper,

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
  getPermissionsSection,
  putPermissionsSection,
  deletePermissionsSection,
  postApplicationSubmit,
  postLicenceResendSubmit,

  // Licences
  getApplicationLicences,
  postPreviousLicence,
  getPreviousLicence,
  putPreviousLicence,
  deletePreviousLicence,

  // Returns
  postReturn,
  getReturnsByLicenceId,
  getReturn,
  putReturn,
  deleteReturn,
  postReturnSubmit,

  // Application-user handlers
  getPreviousLicences,
  getApplicationUsers,
  postApplicationUser,
  getApplicationUserById,
  deleteApplicationUserById,

  // Application file upload
  getApplicationFileUploads,
  postApplicationFileUpload,
  getApplicationFileUpload,
  putApplicationFileUpload,
  deleteApplicationFileUploadByUploadId,

  // Return file upload
  getReturnFileUploads,
  postReturnFileUpload,
  getReturnFileUpload,
  putReturnFileUpload,
  deleteReturnFileUploadByUploadId,

  // Post customer update
  postUserUpdateSubmit,
  postOrganisationUpdateSubmit,

  // Application site handlers
  getApplicationSites,
  getApplicationSiteByApplicationSiteId,
  deleteApplicationSiteByApplicationSiteId,
  postApplicationSite,

  // Habitat site handlers
  postHabitatSite,
  getHabitatSiteByHabitatSiteId,
  getHabitatSitesByApplicationId,
  getHabitatSitesByLicenceId,
  putHabitatSite,
  deleteHabitatSite,

  // Permissions
  postPermission,
  getPermissions,
  getPermission,
  putPermission,
  deletePermission,

  // ecologist experience handlers
  getEcologistExperience,
  putEcologistExperience,
  deleteEcologistExperience,

  // Application Designated Sites
  postApplicationDesignatedSite,
  putApplicationDesignatedSite,
  getApplicationDesignatedSite,
  getApplicationDesignatedSites,
  deleteApplicationDesignatedSite,

  // Miscellaneous handlers
  findApplicationTypes,
  getApplicationTypes,
  getApplicationPurposes,
  getAuthorities,
  getDesignatedSites,
  getOptionSets,
  validationFail,
  notFound,
  postResetHandler,
  postResponseHandler,

  // Feedback
  postFeedback
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

  const handleErrors = errors => {
    for (const error of errors) {
      logger.error(error)
    }
  }

  server.events.on('response', request => {
    let logString = `${request.method.toUpperCase()} ${request.response.statusCode} ${request.path} --> uri: ${request.raw.req.url}`

    if (process.env.LOG_PAYLOADS === 'true' && request?.payload) {
      logString += ` payload: ${JSON.stringify(request.payload)}`
    }

    logger.info(logString)

    if (request?.response?.source?.errors) {
      handleErrors(request.response.source.errors)
    }
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
