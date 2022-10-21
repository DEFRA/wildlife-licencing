import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { LOGIN, APPLICATIONS, TASKLIST } from '../../../uris.js'
import { authJoiObject } from '../auth.js'
import db from 'debug'
import { Backlink } from '../../../handlers/backlink.js'
const debug = db('web-service:login')

// If we have request a which needs authorization then redirect to that page
export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData?.navigation?.requestedPage) {
    return journeyData.navigation.requestedPage
  } else if (!request.auth.isAuthenticated) {
    return TASKLIST.uri
  } else {
    if (journeyData.applicationId) {
      return TASKLIST.uri
    } else {
      return APPLICATIONS.uri
    }
  }
}

export const validator = async payload => {
  const userId = payload['user-id'].toLowerCase()
  Joi.assert({ 'user-id': userId }, authJoiObject)
  const result = await APIRequests.USER.findByName(userId)

  // The API will have cached the result so, it is cheap to get this again in the completion handler where
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
  const journeyData = await request.cache().getData() || {}
  Object.assign(journeyData, { userId: result.id })
  await request.cache().setData(journeyData)
}

// Do not allow the login page if the user is logged in
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData() || {}
  if (journeyData.userId) {
    if (journeyData.applicationId) {
      return h.redirect(TASKLIST.uri)
    } else {
      return h.redirect(APPLICATIONS.uri)
    }
  } else {
    return null
  }
}

export default pageRoute({
  page: LOGIN.page,
  uri: LOGIN.uri,
  options: { auth: false },
  backlink: Backlink.NO_BACKLINK,
  checkData,
  validator,
  completion,
  setData
})
