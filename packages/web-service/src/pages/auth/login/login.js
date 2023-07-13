import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { LOGIN, APPLICATIONS, TASKLIST } from '../../../uris.js'
import db from 'debug'
import { Backlink } from '../../../handlers/backlink.js'
const debug = db('web-service:login')

// If we have request a which needs authorization then redirect to that page
export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (!request.auth.isAuthenticated) {
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
  const { username, password } = payload

  Joi.assert(payload, Joi.object({
    username: Joi.string().email().required().lowercase(),
    password: Joi.string().required().min(8)
  }).options({ abortEarly: false, allowUnknown: true }))

  if (!await APIRequests.USER.authenticate(username, password)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Unauthorized: email address or password not found',
      path: ['password'],
      type: 'unauthorized',
      context: {
        label: 'password',
        value: password,
        key: 'password'
      }
    }], null)
  }
}

// If we have validated then we have an authenticated user and we can save the authorization object
export const setData = async request => {
  const username = request.payload.username.toLowerCase()
  const result = await APIRequests.USER.findByName(username)
  debug(`Logging in user: ${username}`)
  await request.cache().setAuthData(result)
  const journeyData = await request.cache().getData() || {}
  Object.assign(journeyData, { userId: result.id })
  await request.cache().setData(journeyData)

  // if the cookies preferences are set in the session then write it into the user
  if (journeyData.cookies) {
    const user = await APIRequests.USER.getById(journeyData.userId)
    Object.assign(user, { cookiePrefs: journeyData.cookies })
    await APIRequests.USER.update(journeyData.userId, user)
  }
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
