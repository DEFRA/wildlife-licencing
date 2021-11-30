import successHandler from '../success-handler.js'
import { APPLICATION_JSON } from '../../constants.js'
import { insertIntoUsers } from './user-dml.js'
import { v4 as uuidv4 } from 'uuid'

/*
 * Create the new user object and return 201
 */
export default async (context, req, h) => {
  return successHandler(async (client, id, payload) => {
    const res = await insertIntoUsers(client, id, payload)
    return h.response(res.rows[0]).type(APPLICATION_JSON).code(201)
  }, uuidv4(), req.payload)
}
