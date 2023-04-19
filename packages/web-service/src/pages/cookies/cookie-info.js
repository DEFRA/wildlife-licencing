import { COOKIE_INFO, APPLICATIONS } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { APIRequests } from '../../services/api-requests.js'
import { yesNoFromBool } from '../common/common.js'

export const getData = async request => {
  const journeyData = await request.cache().getData() || {}
  if (journeyData.userId) {
    const user = await APIRequests.USER.getById(journeyData.userId)
    return { yesNo: yesNoFromBool(user?.cookiePrefs?.analytics) }
  } else if (journeyData.cookies) {
    return { yesNo: yesNoFromBool(journeyData?.cookies?.analytics) }
  }
  return null
}

export const completion = async request => {
  // Return to the calling page
  const referrer = new URL(request.info.referrer)
  return referrer.pathname !== COOKIE_INFO.uri ? referrer.pathname : APPLICATIONS.uri
}

export const setData = async request => {
  const journeyData = await request.cache().getData() || {}
  journeyData.cookies = { analytics: isYes(request) }
  await request.cache().setData(journeyData)

  // If signed save the cookie preferences
  if (journeyData.userId) {
    const user = await APIRequests.USER.getById(journeyData.userId)
    Object.assign(user, { cookiePrefs: journeyData.cookies })
    await APIRequests.USER.update(journeyData.userId, user)
  }
}

export default yesNoPage({
  page: COOKIE_INFO.page,
  uri: COOKIE_INFO.uri,
  getData: getData,
  setData: setData,
  completion: completion,
  options: { auth: { mode: 'optional' } }
})
