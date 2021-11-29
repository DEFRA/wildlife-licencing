import successHandler from '../success-handler.js'
import { APPLICATION_JSON } from '../../constants.js'

/*
 * Create the new user object and return 201 OR
 * Update existing user object and return result
 */
export default async (context, req, h) => {
  return successHandler(async (client, id, payload) => {
    try {
      let res
      if (payload.sddsId) {
        res = await client.query('INSERT INTO users (id, sdds_id) values ($1, $2) RETURNING *', [id, payload.sddsId])
      } else {
        res = await client.query('INSERT INTO users (id) values ($1) RETURNING *', [id])
      }

      // Return result for validation
      return h.response(res.rows[0]).type(APPLICATION_JSON).code(201)
    } catch (e) {
      // If there is a primary ket violation update
      if (e.message.includes('users_pk')) {
        try {
          let res
          if (payload.sddsId) {
            res = await client.query('UPDATE users SET sdds_id = $2, updated = now() WHERE id = $1 RETURNING *', [id, payload.sddsId])
          } else {
            res = await client.query('UPDATE users SET updated = now(), sdds_id = NULL WHERE id = $1 RETURNING *', [id])
          }

          // Return result for validation
          return h.response(res.rows[0]).type(APPLICATION_JSON).code(200)
        } catch (e) {
          // Throw server error for anything else
          throw new Error(e.message)
        }
      } else {
        // Throw server error for anything else
        throw new Error(e.message)
      }
    }
  }, context.request.params.userId, req.payload)
}
