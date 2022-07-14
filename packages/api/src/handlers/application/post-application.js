import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    // Ensure that the application type and purpose are an allowabe combination
    const application = req.payload
    const { applicationTypeId, applicationPurposeId } = application
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

    const { dataValues } = await models.applications.create({
      application,
      id: uuidv4(),
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/application/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
