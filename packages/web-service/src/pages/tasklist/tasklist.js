import pageRoute from '../../routes/page-route.js'
import { TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'

import { ApplicationService as applicationService } from '../../services/application.js'
import {
  licenceTypeMap, A24, getStatus, SECTION_TASKS, updateStatusCache,
  STATUS_VALUES, decorateMap, getProgress
} from './licence-type-map.js'

export const getApplication = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  let applicationId

  // Look for the applicationId in the query parameter
  const params = new URLSearchParams(request.query)

  // Switch (current) applicationId in the cache if necessary
  const id = params.get('applicationId')

  // If a parameter has been supplied
  if (id) {
    // Check that the parameter is written into the cache as the current parameter
    Object.assign(journeyData, { applicationId: id })
    await request.cache().setData(journeyData)
    applicationId = id
  } else {
    // Where there is no parameter expect to find an id in the cache, otherwise created a new application
    applicationId = journeyData.applicationId ? journeyData.applicationId : await applicationService.createApplication(request)
  }

  // Get the application reference number
  return APIRequests.APPLICATION.getById(userId, applicationId)
}

export const getData = async request => {
  // Search for the correct application
  const application = await getApplication(request)

  // Placeholder - this will be replaced by a state-machine
  const eligibilityStatus = await getStatus(SECTION_TASKS.ELIGIBILITY_CHECK)(request)
  if (eligibilityStatus === STATUS_VALUES.CANNOT_START_YET) {
    await updateStatusCache(request, SECTION_TASKS.ELIGIBILITY_CHECK, STATUS_VALUES.NOT_STARTED)
  }

  const decoratedMap = await decorateMap(request, licenceTypeMap[A24])
  const progress = getProgress(decoratedMap)

  return {
    reference: application.applicationReferenceNumber,
    licenceType: A24,
    licenceTypeMap: decoratedMap,
    progress
  }
}

export const tasklist = pageRoute(TASKLIST.page, TASKLIST.uri, null,
  getData, null, null, null)
