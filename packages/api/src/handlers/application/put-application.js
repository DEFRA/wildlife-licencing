import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { clearApplicationCaches } from './application-cache.js'
import { prepareResponse, alwaysExclude } from './application-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
import db from 'debug'
const { cache } = REDIS
const debug = db('api:post-submission-update')

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const { applicationTypeId, applicationPurposeId } = req.payload
    const applicationTypeApplicationPurpose = await models.applicationTypeApplicationPurposes.findOne({
      where: {
        applicationTypeId, applicationPurposeId
      }
    })

    if (!applicationTypeApplicationPurpose) {
      return h.response({ code: 409, error: { description: `Invalid application type: ${applicationTypeId} for purpose: ${applicationPurposeId}` } })
        .type(APPLICATION_JSON)
        .code(409)
    }

    await clearApplicationCaches(applicationId)

    const [application, created] = await models.applications.findOrCreate({
      where: { id: context.request.params.applicationId },
      defaults: {
        id: applicationId,
        application: alwaysExclude(req.payload),
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(application.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      // Currently an application may only be submitted once. It therefore should not be modified by the
      // front end after that submission. This is not currently an error because that possibility has been deliberately left open
      // However it is suspected that the automated tests are forcing this to happen. To diagnose this log a debug message
      if (application.userSubmission) {
        debug(`Post submission update on ${applicationId}: ${application.application?.applicationReferenceNumber}`)
      }
      const [, updatedApplication] = await models.applications.update({
        application: alwaysExclude(req.payload),
        updateStatus: 'L'
      }, {
        where: {
          id: applicationId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedApplication[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
