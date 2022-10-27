import { models } from '@defra/wls-database-model'
import { verify } from './password.js'

export default async (context, req, h) => {
  try {
    const { userId, password } = context.request.params

    const user = await models.users.findByPk(userId)
    if (!user) {
      return h.response().code(404)
    }

    if (await verify(password, user.password)) {
      return h.response().code(200)
    } else {
      return h.response().code(401)
    }
  } catch (err) {
    console.error('Error inserting into USERS table', err)
    throw new Error(err.message)
  }
}
