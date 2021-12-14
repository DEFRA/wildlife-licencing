import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { cache } from '../../services/cache.js'
import { prepareResponse } from './user-proc.js'

/*
 * Create the new user object and return 201
 */
export default async (context, req, h) => {
  try {
    const user = await models.users.create({
      id: uuidv4()
    })

    const response = prepareResponse(user.dataValues)
    await cache.save(`/user/${user.dataValues.id}`, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into USERS table', err)
    throw new Error(err.message)
  }
}
