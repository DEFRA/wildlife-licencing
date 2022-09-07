import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './ecologist-experience-proc.js'
// import { checkCache } from '../utils.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const ecoExperience = await models.ecologistExperience.findByPk(context.request.params.applicationId)
    if (!ecoExperience) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(ecoExperience.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody.ecologistExperience)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the ECOLOGIST EXPERIENCE table', err)
    throw new Error(err.message)
  }
}
