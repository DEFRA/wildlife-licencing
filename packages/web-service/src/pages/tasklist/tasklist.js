import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { ApplicationService } from '../../services/application.js'
import { LICENCE_TYPE_TASKLISTS } from './licence-type.js'
import { Backlink } from '../../handlers/backlink.js'

/**
 * Assumes to be authenticated
 * @param request
 * @returns {Promise<*>}
 */
export const getApplication = async request => {
  const params = new URLSearchParams(request.query)
  const id = params.get('applicationId')
  // Switching the application. It is previously checked for a valid user association
  if (id) {
    await ApplicationService.switchApplication(request, id)
    return APIRequests.APPLICATION.getById(id)
  } else {
    // Expect the application to be set in the cache
    const { applicationId, userId, applicationRole } = await request.cache().getData()
    // If created newly, it requires to be associated to the user and assigned a reference number
    // (The call is idempotent
    const { application } = await APIRequests.APPLICATION.initialize(userId, applicationId, DEFAULT_ROLE, applicationRole)
    return application
  }
}

export const getData = async request => {
  const application = await getApplication(request)
  // Select the tasklist based on the licence type and the role
  const { applicationRole } = await request.cache().getData()
  const licenceType = LICENCE_TYPE_TASKLISTS[application.applicationTypeId][applicationRole]
  const showReference = await licenceType.canShowReference(request)
  return {
    ...(showReference && { reference: application.applicationReferenceNumber }),
    reference: application.applicationReferenceNumber,
    licenceType: licenceType.name,
    licenceTypeMap: await licenceType.decorate(request),
    progress: await licenceType.getProgress(request)
  }
}

/**
 * Redirect to the applications' page if:
 * (1) given an applicationId in the query parameter, and it does not belong to the signed-in user
 * (2) If there is no applicationId set in the user cache
 * (3) The applicationId set in the user cache does not exist
 */
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const params = new URLSearchParams(request.query)
  if (params.get('applicationId')) {
    const id = params.get('applicationId')
    // Check is assigned to the user with the default role
    const roles = await APIRequests.APPLICATION.findRoles(journeyData.userId, id)
    if (!roles.includes(DEFAULT_ROLE)) {
      return h.redirect(APPLICATIONS.uri)
    }
    const application = await APIRequests.APPLICATION.getById(id)
    if (application?.userSubmission) {
      return h.redirect(APPLICATIONS.uri)
    }
  } else {
    if (journeyData.applicationId && journeyData.applicationRole) {
      const application = APIRequests.APPLICATION.getById(journeyData.applicationId)
      if (!application) {
        return h.redirect(APPLICATIONS.uri)
      }
    } else {
      return h.redirect(APPLICATIONS.uri)
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
  checkData,
  getData
})
