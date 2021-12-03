/*
 * Create the application user object and return 201
 */
import { models } from '../../model/sequentelize-model.js'
import { APPLICATION_JSON } from '../../constants.js'
import { cache } from '../../services/cache.js'

export default async (context, req, h) => {
  try {
    const user = await models.users.findByPk(context.request.params.userId)

    // Check the user exists
    if (!user) {
      return h.response().code(404)
    }

    // Invalidates this cache
    await cache.delete(`/user/${context.request.params.userId}/applications`)

    const applicationPayload = (({ sddsId, ...l }) => l)(req.payload)

    const [application, created] = await models.applications.findOrCreate({
      where: { id: context.request.params.applicationId },
      defaults: {
        id: context.request.params.applicationId,
        userId: context.request.params.userId,
        sddsId: req.payload?.sddsId ?? null,
        application: applicationPayload
      }
    })

    if (created) {
      // Cache
      await cache.save(req.path, application.dataValues)
      return h.response(application.dataValues)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedApplication] = await models.applications.update({
        sddsId: req.payload?.sddsId ?? null,
        application: applicationPayload
      }, {
        where: {
          id: context.request.params.applicationId
        },
        returning: true
      })
      // Cache
      await cache.save(req.path, updatedApplication[0].dataValues)
      return h.response(updatedApplication[0].dataValues)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
