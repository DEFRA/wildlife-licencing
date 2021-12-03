/*
 * Create the application user object and return 201
 */
import { v4 as uuidv4 } from 'uuid'
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

    const a = await models.applications.create({
      id: uuidv4(),
      userId: context.request.params.userId,
      sddsId: req.payload?.sddsId ?? null,
      application: applicationPayload
    })

    await cache.save(`/user/${a.dataValues.userId}/application/${a.dataValues.id}`, a.dataValues)
    return h.response(a.dataValues)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
