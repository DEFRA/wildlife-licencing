import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { prepareResponse } from './habitat-site-proc.js'
import { validateRelations } from './validate-relations.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // If the application does not exist return a not found and error
    if (!application) {
      return h.response({ code: 404, error: { description: `applicationId: ${applicationId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const applicationType = await models.applicationTypes.findByPk(application.application.applicationTypeId)
    const { activityId, speciesId, methodIds, settType } = req.payload
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    if (err) {
      return h.response({ code: 409, error: err })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const { dataValues } = await models.habitatSites.create({
      id: uuidv4(),
      applicationId: applicationId,
      habitatSite: req.payload,
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/application/${dataValues.id}`, responseBody)

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into HABITAT-SITES table', err)
    throw new Error(err.message)
  }
}
