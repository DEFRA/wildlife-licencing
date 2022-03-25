import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { REGISTER, LOGIN } from '../../../uris.js'
import { authJoiObject } from '../auth.js'

export const completion = async request => {
  // On a successful registration clear the auto-saved page data and
  // return to the login scheme
  await request.cache().clearPageData()
  await request.cache().clearPageData(LOGIN.page)
  return LOGIN.uri
}

export const validator = async payload => {
  const userId = payload['user-id'].toLowerCase()
  Joi.assert({ 'user-id': userId }, authJoiObject)
  const result = await APIRequests.USER.findUserByName(payload['user-id'])
  if (result) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Email address already exists',
      path: ['user-id'],
      type: 'duplicate',
      context: {
        label: 'user-id',
        value: userId,
        key: 'user-id'
      }
    }], null)
  }
}

// If we have validated then we have an authenticated user and we can save the authorization object
export const setData = async request => APIRequests.USER.addUser(request.payload['user-id'].toLowerCase())

export default pageRoute(
  REGISTER.page,
  REGISTER.uri,
  validator,
  completion,
  null,
  setData,
  {
    auth: false
  })
