import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { toHash } from './password.js'
const { cache } = REDIS

/*
 * Create the new user object and return 201.
 */
export default async (context, req, h) => {
  try {
    // Trim and remove any spaces, and ensure lower-case storage
    const username = req.payload.username.toLowerCase()

    // Ensure the username is not taken
    const users = await models.users.findAll({
      where: { username }
    })

    if (users.length) {
      return h.response({ code: 400, error: { description: `username: '${username}' already exists` } })
        .type(APPLICATION_JSON)
        .code(400)
    }

    const user = await models.users.create({
      id: uuidv4(),
      username,
      ...(req.payload.password && { password: await toHash(req.payload.password) })
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
