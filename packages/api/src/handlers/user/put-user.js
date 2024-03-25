import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse, alwaysExclude } from './user-proc.js'

/*
 * Updates the user object and return 200.
 */
export default async (context, req, h) => {
  try {
    const { userId } = context.request.params
    const [user, created] = await models.users.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        username: req.payload.username,
        user: alwaysExclude(Object.assign({}, req.payload)),
        cookiePrefs: req.payload?.cookiePrefs
      }
    })

    if (created) {
      const response = prepareResponse(user.dataValues)
      return h.response(response)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      // Can update fields: cookiePrefs, email, lastName, firstName
      const updateObject = {
        ...(req.payload.cookiePrefs && { cookiePrefs: req.payload.cookiePrefs }),
        ...((req.payload.email || req.payload.firstName || req.payload.lastName) && {
          user: {
            email: req.payload?.email || user.dataValues.email?.firstName,
            firstName: req.payload?.firstName || user.dataValues.user?.firstName,
            lastName: req.payload?.lastName || user.dataValues.user?.lastName
          }
        })
      }

      // Look for the no-op
      if (Object.keys(updateObject).length === 0) {
        const response = prepareResponse(user.dataValues)
        return h.response(response)
          .type(APPLICATION_JSON)
          .code(202)
      }

      const [, updatedUser] = await models.users.update(updateObject, {
        where: { id: userId },
        returning: true
      })

      const responseBody = prepareResponse(updatedUser[0].dataValues)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error updating the USERS table', err)
    throw new Error(err.message)
  }
}
