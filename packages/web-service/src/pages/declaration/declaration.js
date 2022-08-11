import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, DECLARATION, SUBMISSION } from '../../uris.js'
import { ApplicationService } from '../../services/application.js'
import { APIRequests } from '../../services/api-requests.js'

// Do not allow an attempt at resubmission
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)
  if (application.userSubmission) {
    return h.redirect(APPLICATIONS.uri)
  }
  return null
}

export const setData = async request => ApplicationService.submitApplication(request)
export default pageRoute({
  page: DECLARATION.page,
  uri: DECLARATION.uri,
  completion: SUBMISSION.uri,
  checkData,
  setData
})
