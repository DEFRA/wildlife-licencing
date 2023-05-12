import pageRoute from '../../routes/page-route.js'
import { SUBMISSION, APPLICATIONS, TASKLIST } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { isAppSubmittable } from '../tasklist/licence-type.js'
import { APIRequests } from '../../services/api-requests.js'
import { checkApplication } from '../common/check-application.js'

export const checkData = async (request, h) => {
  if (!await isAppSubmittable(request)) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}

export const getData = async request => {
  const { userId, applicationId } = await request.cache().getData()

  const allApplications = await APIRequests.APPLICATION.findByUser(userId)
  const currentApplication = allApplications.filter(applic => applic.id === applicationId)

  return {
    currentApplication: currentApplication[0]
  }
}

export default pageRoute({
  page: SUBMISSION.page,
  uri: SUBMISSION.uri,
  completion: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: [checkData, checkApplication],
  getData
})
