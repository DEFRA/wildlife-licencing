/*
 * Create the application user object and return 201
 */
import { models } from '../../model/sequentelize-model.js'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, req, h) => {
  try {
    const user = await models.users.findByPk(context.request.params.userId)

    // Check the user exists
    if (!user) {
      return h.response().code(404)
    }

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
      return h.response(updatedApplication[0].dataValues)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
