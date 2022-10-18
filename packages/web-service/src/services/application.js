import { APIRequests } from './api-requests.js'
import db from 'debug'
import { clearPageData, clearData } from './cache-operations.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const debug = db('web-service:application-service')

/**
 * Cache and API operations concerning applications.
 * @type {{
 * switchApplication: (function(*, *): Promise<*>),
 * createApplication: (function(*): Promise<*>),
 * submitApplication: ((function(*): Promise<void>)|*), associateApplication: (function(*, *): Promise<*>)
 * }}
 */
export const ApplicationService = {
  createApplication: async request => {
    const journeyData = await request.cache().getData() || {}
    const application = await APIRequests.APPLICATION.create(PowerPlatformKeys.APPLICATION_TYPES.A24,
      PowerPlatformKeys.APPLICATION_PURPOSES.DEVELOPMENT)
    Object.assign(journeyData, { applicationId: application.id })
    await request.cache().setData(journeyData)
    await clearPageData(request)
    await clearData(request)
    return application
  },
  associateApplication: async (request, role) => {
    const journeyData = await request.cache().getData()
    const { userId, applicationId } = journeyData
    const { applicationUser, application } = await APIRequests.APPLICATION.initialize(userId, applicationId, role)
    Object.assign(journeyData, { applicationUserId: applicationUser.id, role })
    await request.cache().setData(journeyData)
    return application
  },
  // Switch the cache only - no API call at this moment. It maintains the userId
  // and does not associate
  switchApplication: async (request, id) => {
    const journeyData = await request.cache().getData()
    if (!journeyData.applicationId || (journeyData.applicationId && id !== journeyData.applicationId)) {
      journeyData.applicationId = id
      delete journeyData.applicationUserId
      delete journeyData.role
      await request.cache().setData(journeyData)
      await clearPageData(request)
      await clearData(request)
    }
    return id
  },
  submitApplication: async request => {
    const journeyData = await request.cache().getData()
    const { applicationId } = journeyData
    debug(`Submitting applicationId: ${applicationId}`)
    await APIRequests.APPLICATION.submit(applicationId)
  }
}
