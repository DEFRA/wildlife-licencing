import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './user-proc.js'

export default async (_context, req, h) => {
  try {
    let users
    if (req.query?.username) {
      const username = req.query.username
      users = await models.users.findAll({
        where: { username }
      })
    } else {
      users = await models.users.findAll()
    }

    const response = users.map(u => prepareResponse(u.dataValues))
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error inserting into USERS table', err)
    throw new Error(err.message)
  }
}
