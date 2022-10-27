import { models } from '@defra/wls-database-model'
import { verify } from './password.js'

export default async (context, _req, h) => {
  try {
    const { userId, password } = context.request.params

    const user = await models.users.findByPk(userId)
    if (!user) {
      return h.response().code(404)
    }

    return await verify(password, user?.password) ? h.response().code(200) : h.response().code(401)
  } catch (err) {
    console.error('Error inserting into USERS table', err)
    throw new Error(err.message)
  }
}
