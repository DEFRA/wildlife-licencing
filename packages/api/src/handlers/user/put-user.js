import { APPLICATION_JSON } from '../../constants.js'
import { models } from '../../../../database-model/src/sequentelize-model.js'
import { cache } from '../../services/cache.js'
import { prepareResponse } from './user-proc.js'

/*
 * Create the new user object and return 201 OR
 * Update existing user object and return 200
 */
export default async (context, req, h) => {
  try {
    const [user, created] = await models.users.findOrCreate({
      where: { id: context.request.params.userId },
      defaults: {
        sddsId: req.payload?.sddsId ?? null
      }
    })

    if (created) {
      const response = prepareResponse(user.dataValues)
      await cache.save(req.path, response)
      return h.response(response)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedUser] = await models.users.update({ sddsId: req.payload?.sddsId ?? null }, {
        where: { id: context.request.params.userId },
        returning: true
      })
      const response = prepareResponse(updatedUser[0].dataValues)
      await cache.save(req.path, response)
      return h.response(response)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the USERS table', err)
    throw new Error(err.message)
  }
}
