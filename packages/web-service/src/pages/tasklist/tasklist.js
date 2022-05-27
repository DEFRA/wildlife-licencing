import pageRoute from '../../routes/page-route.js'
import { TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { ApplicationService, ApplicationService as applicationService } from '../../services/application.js'
import { licenceTypeMap, A24, decorateMap, getProgress, getTaskStatus } from './licence-type-map.js'
import Boom from '@hapi/boom'

// export const getApplication = async request => {
//   const journeyData = await request.cache().getData()
//   const userId = journeyData?.userId
//   let applicationId
//
//   // Look for the applicationId in the query parameter
//   const params = new URLSearchParams(request.query)
//
//   // Switch (current) applicationId in the cache if necessary
//   const id = params.get('applicationId')
//
//   // If a parameter has been supplied
//   if (id) {
//     // Check that the parameter is written into the cache as the current applicationId
//     Object.assign(journeyData, { applicationId: id })
//     await request.cache().setData(journeyData)
//     applicationId = id
//   } else {
//     // Where there is no parameter expect to find an id in the cache, otherwise created a new application
//     applicationId = journeyData?.applicationId ? journeyData.applicationId : await applicationService.createApplication(request, userId)
//   }
//
//   // Ensure that if logged in this user has access to the application
//   if (userId) {
//     const roles = await APIRequests.APPLICATION.findRoles(userId, applicationId)
//     if (!roles.includes(DEFAULT_ROLE)) {
//       throw Boom.unauthorized(`User ${userId} as no authorization to view applicationId: ${applicationId}`)
//     }
//   }
//
//   // Get the application reference number
//   return APIRequests.APPLICATION.getById(applicationId)
// }

export const getData = async request => {
  // If there is no application then create a pre-application
  const journeyData = await request.cache().getData() || {}

  const params = new URLSearchParams(request.query)
  const id = params.get('applicationId')
  if (id) {
    Object.assign(journeyData, { applicationId: id })
    await request.cache().setData(journeyData)
  }

  let application = journeyData.applicationId
    ? await APIRequests.APPLICATION.getById(journeyData.applicationId)
    : await ApplicationService.createApplication(request)

  // If we are signed in then the application can be associated with the user
  if (journeyData?.userId) {
    application = await ApplicationService.associateApplication(request)
  }

  const status = await getTaskStatus(request)
  const decoratedMap = await decorateMap(licenceTypeMap[A24], status)
  const progress = getProgress(status)

  return {
    reference: application?.applicationReferenceNumber,
    licenceType: A24,
    licenceTypeMap: decoratedMap,
    progress
  }
}

export const tasklist = pageRoute(TASKLIST.page, TASKLIST.uri, null,
  getData, null, null, null, { auth: { mode: 'optional' } })
