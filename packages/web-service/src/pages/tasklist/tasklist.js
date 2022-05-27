import pageRoute from '../../routes/page-route.js'
import { TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { ApplicationService } from '../../services/application.js'
import { licenceTypeMap, A24, decorateMap, getProgress, getTaskStatus } from './licence-type-map.js'

export const getData = async request => {
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
