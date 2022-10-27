import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-proc.js'
import { toHash } from './password.js'

/*
 * Updates the user object and return 200. Updates password only at this time
 */
export default async (context, req, h) => {
  try {
    const { userId } = context.request.params

    // This does nothing if a password (change) is not supplied at this point,
    // but it will probably be changed when the IDM is introduced
    if (!req.payload.password) {
      return h.response().code(200)
    }

    const user = await models.users.findByPk(userId)
    if (!user) {
      return h.response().code(404)
    }

    const [, updatedUser] = await models.users.update({
      password: await toHash(req.payload.password)
    }, {
      where: {
        id: userId
      },
      returning: true
    })

    const response = prepareResponse(updatedUser[0].dataValues)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error updating the USERS table', err)
    throw new Error(err.message)
  }
}
