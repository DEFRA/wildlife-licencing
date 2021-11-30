import successHandler from '../success-handler.js'
import { APPLICATION_JSON } from '../../constants.js'
import { insertIntoUsers, updateUsers } from './users-dml.js'

/*
 * Create the new user object and return 201 OR
 * Update existing user object and return result
 */
export default async (context, req, h) => {
  return successHandler(async (client, id, payload) => {
    const res = await insertIntoUsers(client, id, payload)
    if (res) {
      return h.response(res.rows[0]).type(APPLICATION_JSON).code(201)
    } else {
      const res = await updateUsers(client, id, payload)
      return h.response(res.rows[0]).type(APPLICATION_JSON).code(200)
    }
  }, context.request.params.userId, req.payload)
}
