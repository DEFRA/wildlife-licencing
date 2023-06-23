import pageRoute from '../../routes/page-route.js'
import { SUBMISSION, APPLICATIONS, TASKLIST } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { isAppSubmittable } from '../tasklist/licence-type.js'
import { APIRequests } from '../../services/api-requests.js'

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

export const checkApplication = async (request, h) => {
  const journeyData = await request.cache().getData()

  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

export default pageRoute({
  page: SUBMISSION.page,
  uri: SUBMISSION.uri,
  completion: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: [checkData, checkApplication],
  getData
})
