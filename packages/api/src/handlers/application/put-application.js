import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { clearCaches } from './application-cache.js'
import { prepareResponse } from './application-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { userId, applicationId } = context.request.params
    const user = await models.users.findByPk(context.request.params.userId)

    // Check the user exists
    if (!user) {
      return h.response().code(404)
    }

    await clearCaches(userId, applicationId)

    const [application, created] = await models.applications.findOrCreate({
      where: { id: context.request.params.applicationId },
      defaults: {
        id: applicationId,
        userId: userId,
        application: req.payload,
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
      const [, updatedApplication] = await models.applications.update({
        application: req.payload,
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
