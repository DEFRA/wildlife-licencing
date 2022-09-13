import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './ecologist-experience-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { checkCache } from '../utils.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const result = await checkCache(req)
    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }
    const ecoExperience = await models.ecologistExperience.findOne({ where: { applicationId: context.request.params.applicationId } })
    if (!ecoExperience) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(ecoExperience.dataValues)
    await cache.save(req.path, responseBody.ecologistExperience)
    return h.response(responseBody.ecologistExperience)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the ECOLOGIST EXPERIENCE table', err)
    throw new Error(err.message)
  }
}
