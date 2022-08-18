import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'

export const getUserData = _contactType => async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

export const setUserData = _contactType => async request => {
}

export const userCompletion = (contactType, apiBase) => async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload['yes-no'] === 'yes') {
    return apiBase.USER.uri // This is pending build
  }
  const { userId } = await request.cache().getData()
  const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
  if (contacts.length) {
    return apiBase.NAMES.uri
  } else {
    return apiBase.NAME.uri
  }
}
