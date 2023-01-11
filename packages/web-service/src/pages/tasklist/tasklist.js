import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { ApplicationService } from '../../services/application.js'
import { licenceTypeMap, decorateMap, getProgress, getTaskStatus, SECTION_TASKS, A24 } from './licence-type-map.js'
import { Backlink } from '../../handlers/backlink.js'
import { isComplete } from '../common/tag-functions.js'

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

  const decoratedMap = await decorateMap(licenceTypeMap[A24], request)
  // const progress = getProgress(status)

  return {
    // ...(isComplete(status[SECTION_TASKS.ELIGIBILITY_CHECK].tagState) && { reference: application.applicationReferenceNumber }),
    reference: application.applicationReferenceNumber,
    licenceType: A24,
    licenceTypeMap: decoratedMap,
    progress: null
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

export const tasklistBacklink = async request => {
  if (request.auth.isAuthenticated) {
    const { userId } = await request.cache().getData()
    const applications = await APIRequests.APPLICATION.findByUser(userId)
    return applications.length > 1 ? Backlink.JAVASCRIPT.value() : Backlink.NO_BACKLINK.value()
  } else {
    return Backlink.NO_BACKLINK.value()
  }
}

export const tasklist = pageRoute({
  page: TASKLIST.page,
  uri: TASKLIST.uri,
  backlink: new Backlink(tasklistBacklink),
  options: { auth: { mode: 'optional' } },
  checkData,
  getData
})
