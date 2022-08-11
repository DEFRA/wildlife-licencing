import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse, alwaysExclude } from './habitat-site-proc.js'
import { validateRelations } from './validate-relations.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, habitatSiteId } = context.request.params
    await cache.delete(req.path)

    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const applicationType = await models.applicationTypes.findByPk(application.application.applicationTypeId)
    const { activityId, speciesId, methodIds, settType } = req.payload
    const err = await validateRelations(applicationType, activityId, speciesId, methodIds, settType)
    if (err) {
      return h.response({ code: 409, error: err })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const [habitatSite, created] = await models.habitatSites.findOrCreate({
      where: { id: habitatSiteId },
      defaults: {
        id: applicationId,
        habitatSite: alwaysExclude(req.payload),
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(habitatSite.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedHabitatSite] = await models.habitatSites.update({
        habitatSite: alwaysExclude(req.payload),
        updateStatus: 'L'
      }, {
        where: {
          id: habitatSiteId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedHabitatSite[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error updating from the HABITAT-SITES table', err)
    throw new Error(err.message)
  }
}
