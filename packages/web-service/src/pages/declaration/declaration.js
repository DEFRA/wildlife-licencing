import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, DECLARATION, SUBMISSION, TASKLIST } from '../../uris.js'
import { ApplicationService } from '../../services/application.js'
import { APIRequests } from '../../services/api-requests.js'
import { isAppSubmittable } from '../tasklist/licence-type.js'
import { checkApplication } from '../common/check-application.js'

// Do not allow an attempt at resubmission
export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()

  const application = await APIRequests.APPLICATION.getById(applicationId)
  if (application.userSubmission) {
    return h.redirect(APPLICATIONS.uri)
  }

  if (!await isAppSubmittable(request)) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}

export const setData = async request => ApplicationService.submitApplication(request)
export default pageRoute({
  page: DECLARATION.page,
  uri: DECLARATION.uri,
  completion: SUBMISSION.uri,
  checkData: [checkApplication, checkData],
  setData
})
