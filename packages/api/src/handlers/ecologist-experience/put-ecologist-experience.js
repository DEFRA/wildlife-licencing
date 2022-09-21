import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse, alwaysExclude } from './ecologist-experience-proc.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    await cache.delete(req.path)

    const ecologistExperienceData = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!ecologistExperienceData) {
      return h.response().code(404)
    }

    const [ecologistExperience, created] = await models.ecologistExperience.findOrCreate({
      where: { applicationId: applicationId },
      defaults: {
        id: applicationId,
        experience: alwaysExclude(req.payload),
        updateStatus: 'L'
      }
    })
    if (created) {
      const responseBody = prepareResponse(ecologistExperience.dataValues)
      await cache.save(req.path, responseBody.ecologistExperience)
      return h.response(responseBody.ecologistExperience)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedEcologistExperience] = await models.ecologistExperience.update({
        experience: alwaysExclude(req.payload),
        updateStatus: 'L'
      }, {
        where: {
          applicationId: applicationId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedEcologistExperience[0].dataValues)
      await cache.save(req.path, responseBody.ecologistExperience)
      return h.response(responseBody.ecologistExperience)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error updating from the HABITAT-SITES table', err)
    throw new Error(err.message)
  }
}
