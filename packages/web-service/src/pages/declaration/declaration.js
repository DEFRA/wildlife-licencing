import pageRoute from '../../routes/page-route.js'
import { countCompleteSections } from '../common/count-complete-sections.js'
import { APPLICATIONS, DECLARATION, SUBMISSION, TASKLIST } from '../../uris.js'
import { ApplicationService } from '../../services/application.js'
import { APIRequests } from '../../services/api-requests.js'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'
import { checkApplication } from '../common/check-application.js'

// Do not allow an attempt at resubmission
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()

  const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)
  if (application.userSubmission) {
    return h.redirect(APPLICATIONS.uri)
  }

  const totalSections = Object.keys(SECTION_TASKS).length - 3 // TEMP
  const totalCompletedSections = await countCompleteSections(journeyData.applicationId)

  if (totalCompletedSections.length < totalSections) {
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
