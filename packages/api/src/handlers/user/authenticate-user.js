import { models } from '@defra/wls-database-model'
import { verify } from './password.js'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, _req, h) => {
  try {
    const { username, password } = context.request.params

    const [user] = await models.users.findAll({
      where: { username: username.toLowerCase() }
    })

    if (!user) {
      return h.response({ result: false }).code(200)
    }

    return h.response({ result: await verify(password, user.password) })
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from USERS table', err)
    throw new Error(err.message)
  }
}
