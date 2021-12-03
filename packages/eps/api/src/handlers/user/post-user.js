import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { models } from '../../model/sequentelize-model.js'
import { cache } from '../../services/cache.js'

/*
 * Create the new user object and return 201
 */
export default async (context, req, h) => {
  try {
    const user = await models.users.create({
      id: uuidv4(),
      sddsId: req.payload?.sddsId ?? null
    })

    await cache.save(`/user/${user.dataValues.id}`, user.dataValues)
    return h.response(user.dataValues)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into USERS table', err)
    throw new Error(err.message)
  }
}
