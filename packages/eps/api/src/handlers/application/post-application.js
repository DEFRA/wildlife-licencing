import successHandler from '../success-handler.js'
import { APPLICATION_JSON } from '../../constants.js'
import { insertIntoApplications } from './application-dml.js'
import { v4 as uuidv4 } from 'uuid'

/*
 * Create the new user object and return 201
 */
export default async (context, req, h) => {
  return successHandler(async (client, userId, applicationId, payload) => {
    const res = await insertIntoApplications(client, userId, applicationId, payload)

    // If there is no row return userId not found
    if (res.rowCount === 0) {
      return h.response().code(404)
    }

    // Return 201 - created
    return h.response(res.rows[0])
      .type(APPLICATION_JSON)
      .code(201)
  }, context.request.params.userId, uuidv4(), req.payload)
}
