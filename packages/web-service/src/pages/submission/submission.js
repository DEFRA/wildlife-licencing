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
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)

  return {
    currentApplication: application
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
