import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-proc.js'
import { toHash } from './password.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

/*
 * Updates the user object and return 200.
 */
export default async (context, req, h) => {
  try {
    const { userId } = context.request.params

    // This does nothing if a password (change) or cookie preferences is not supplied at this point,
    if (!req.payload.password && !req.payload.cookiePrefs) {
      return h.response().code(204)
    }

    const [found, updatedUser] = await models.users.update({
      ...(req.payload.cookiePrefs && { cookiePrefs: req.payload.cookiePrefs }),
      ...(req.payload.password && { password: await toHash(req.payload.password) })
    }, {
      where: {
        id: userId
      },
      returning: true
    })

    if (found !== 1) {
      return h.response().code(404)
    }

    const response = prepareResponse(updatedUser[0].dataValues)
    await cache.save(`/user/${userId}`, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error updating the USERS table', err)
    throw new Error(err.message)
  }
}
