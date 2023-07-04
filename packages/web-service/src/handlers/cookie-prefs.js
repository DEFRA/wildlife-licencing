import { boolFromYesNo } from '../pages/common/common.js'
import { APIRequests } from '../services/api-requests.js'

export default async (request, h) => {
  const journeyData = await request.cache().getData() || {}
  journeyData.cookies = { analytics: boolFromYesNo(request.query.analytics) }
  await request.cache().setData(journeyData)

  // If signed save the cookie preferences
  if (journeyData.userId) {
    const user = await APIRequests.USER.getById(journeyData.userId)
    Object.assign(user, { cookiePrefs: journeyData.cookies })
    await APIRequests.USER.update(journeyData.userId, user)
  }

  // Return to the calling page
  const referrer = new URL(request.info.referrer)
  return h.redirect(referrer)
}
