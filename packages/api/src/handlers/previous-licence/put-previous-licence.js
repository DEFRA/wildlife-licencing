import { REDIS } from '@defra/wls-connectors-lib'
import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse, alwaysExclude } from './previous-licence-proc.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, licenceId } = context.request.params
    await cache.delete(req.path)

    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const [previousLicence, created] =
      await models.previousLicences.findOrCreate({
        where: { id: licenceId },
        defaults: {
          id: licenceId,
          applicationId: applicationId,
          licence: alwaysExclude(req.payload),
          updateStatus: 'L'
        }
      })

    if (created) {
      const responseBody = prepareResponse(previousLicence.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(201)
    } else {
      const [, updatedPreviousLicence] = await models.previousLicences.update(
        {
          licence: alwaysExclude(req.payload),
          updateStatus: 'L'
        },
        {
          where: {
            id: licenceId
          },
          returning: true
        }
      )
      const responseBody = prepareResponse(updatedPreviousLicence[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(200)
    }
  } catch (err) {
    console.error('Error updating from the PREVIOUS-LICENCES table', err)
    throw new Error(err.message)
  }
}
