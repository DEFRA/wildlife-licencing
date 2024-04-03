import { boolFromYesNo } from '../pages/common/common.js'
import { APIRequests } from '../services/api-requests.js'

export default async (request, h) => {
  const journeyData = await request.cache().getData() || {}

  // If signed save the cookie preferences
  if (journeyData.userId) {
    const user = await APIRequests.USER.getById(journeyData.userId)

    const cookiePrefs = user.cookiePrefs || {}

    if (request.query.analytics) {
      cookiePrefs.analytics = boolFromYesNo(request.query.analytics)
      Object.assign(user, { cookiePrefs })
    }

    if (request.query.hideMessage) {
      cookiePrefs.hideMessage = boolFromYesNo(request.query.hideMessage)
      Object.assign(user, { cookiePrefs })
    }

    await APIRequests.USER.update(journeyData.userId, user)
  }

  // Return to the calling page
  const referrer = new URL(request.info.referrer)
  return h.redirect(referrer)
}
