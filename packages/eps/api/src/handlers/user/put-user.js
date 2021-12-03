import { APPLICATION_JSON } from '../../constants.js'
import { models } from '../../model/sequentelize-model.js'
import { cache } from '../../services/cache.js'

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
      // Cache
      await cache.save(req.path, user.dataValues)
      return h.response(user.dataValues)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedUser] = await models.users.update({ sddsId: req.payload?.sddsId ?? null }, {
        where: { id: context.request.params.userId },
        returning: true
      })
      await cache.save(req.path, updatedUser[0].dataValues)
      return h.response(updatedUser[0].dataValues)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the USERS table', err)
    throw new Error(err.message)
  }
}
