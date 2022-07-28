import pageRoute from '../../routes/page-route.js'
import { FILE_UPLOAD, APPLICATIONS, TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { ApplicationService } from '../../services/application.js'
import { licenceTypeMap, A24, decorateMap, getProgress, getTaskStatus } from './licence-type-map.js'

export const getApplication = async request => {
  // If there is no application then create a pre-application
  let journeyData = await request.cache().getData() || {}

  const params = new URLSearchParams(request.query)
  const id = params.get('applicationId')

  if (id) {
    await ApplicationService.switchApplication(request, id)
    journeyData = await request.cache().getData()
  }

  let application = journeyData.applicationId
    ? await APIRequests.APPLICATION.getById(journeyData.applicationId)
    : await ApplicationService.createApplication(request)

  // If we are signed in then the application can be associated with the user if it has not already
  if (journeyData.userId && !journeyData.applicationUserId) {
    application = await ApplicationService.associateApplication(request, DEFAULT_ROLE)
  }

  return application
}

export const getData = async request => {
  const application = await getApplication(request)

  const status = await getTaskStatus(request)
  const decoratedMap = await decorateMap(licenceTypeMap[A24], status)
  const progress = getProgress(status)

  // If you navigate to the TASKLIST page, we need to ensure we've cleared all the error states on the file-upload page
  await request.cache().clearPageData(FILE_UPLOAD.page)

  return {
    reference: application?.applicationReferenceNumber,
    licenceType: A24,
    licenceTypeMap: decoratedMap,
    progress
  }
}

/**
 * If signed in and there is no selected application but there are saved applications then redirect
 * to the applications-page, unless you are selecting an existing application
 */
export const checkData = async (request, h) => {
  if (request.auth.isAuthenticated) {
    const params = new URLSearchParams(request.query)
    if (!params.get('applicationId')) {
      const journeyData = await request.cache().getData()
      const { userId } = journeyData
      if (!journeyData.applicationId) {
        const applications = await APIRequests.APPLICATION.findByUser(userId)
        if (applications.length) {
          return h.redirect(APPLICATIONS.uri)
        }
      }
    }
  }
  return null
}

export const tasklist = pageRoute({ page: TASKLIST.page, uri: TASKLIST.uri, options: { auth: { mode: 'optional' } }, checkData, getData })
