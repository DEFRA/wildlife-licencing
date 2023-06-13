import pageRoute from '../../routes/page-route.js'
import { SUBMISSION, APPLICATIONS } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { APIRequests } from '../../services/api-requests.js'

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.submittedApplicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

export const getData = async request => {
  const { submittedApplicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(submittedApplicationId)

  return {
    currentApplication: application
  }
}

export default pageRoute({
  page: SUBMISSION.page,
  uri: SUBMISSION.uri,
  completion: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: [checkData],
  getData
})
