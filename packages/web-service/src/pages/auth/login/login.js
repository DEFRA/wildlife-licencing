import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { LOGIN, APPLICATIONS } from '../../../uris.js'
import { authJoiObject } from '../auth.js'
import db from 'debug'
const debug = db('web-service:login')

export const completion = async () => APPLICATIONS.uri

export const validator = async payload => {
  const userId = payload['user-id'].toLowerCase()
  Joi.assert({ 'user-id': userId }, authJoiObject)
  const result = await APIRequests.USER.findByName(payload['user-id'])

  // The API will have cached the result so it is cheap to get this again in the completion handler where
  // we can easily rewrite to the cache
  if (!result) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Unauthorized: email address not found',
      path: ['user-id'],
      type: 'unauthorized',
      context: {
        label: 'user-id',
        value: userId,
        key: 'user-id'
      }
    }], null)
  }
}

// If we have validated then we have an authenticated user and we can save the authorization object
export const setData = async request => {
  const username = request.payload['user-id'].toLowerCase()
  const result = await APIRequests.USER.findByName(username)
  debug(`Logging in user: ${username}`)
  await request.cache().setAuthData(result)
  await request.cache().setData({ userId: result.id })
}

export default pageRoute(
  LOGIN.page,
  LOGIN.uri,
  validator,
  completion,
  null,
  setData,
  {
    auth: false
  })
