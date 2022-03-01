import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './user-proc.js'
import { cache } from '../../services/cache.js'

export default async (_context, req, h) => {
  try {
    const params = new URLSearchParams(req.query)
    const key = params.toString().length ? `${req.path}?${params.toString()}` : req.path
    const saved = await cache.restore(key)

    if (saved) {
      return h.response(JSON.parse(saved))
        .type(APPLICATION_JSON)
        .code(200)
    }

    let users
    if (req.query?.username) {
      const username = req.query.username.trim().replace(/\s{2,}/g, ' ')
      users = await models.users.findAll({
        where: { username }
      })
    } else {
      users = await models.users.findAll()
    }

    const response = users.map(u => prepareResponse(u.dataValues))

    // Only cache non-zero results
    if (response.length) {
      await cache.save(key, response)
    }

    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error inserting into USERS table', err)
    throw new Error(err.message)
  }
}
