import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse, alwaysExclude } from './ecologist-experience-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { dataValues } = await models.ecologistExperience.create({
      id: uuidv4(),
      applicationId: context.request.params.applicationId,
      experience: alwaysExclude(req.payload),
      updateStatus: 'L'
    })
    const responseBody = prepareResponse(dataValues)
    await cache.save(`/experience/${dataValues.id}`, responseBody)
    return h.response(responseBody.ecologistExperience)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into ECOLOGIST EXPERIENCE table', err)
    throw new Error(err.message)
  }
}
