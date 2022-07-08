import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { prepareResponse } from './habitat-site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS
export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // If the application does not exist return a bad request and error
    if (!application) {
      return h.response({ code: 400, error: { description: `applicationId: ${applicationId} not found` } })
        .type(APPLICATION_JSON)
        .code(400)
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
