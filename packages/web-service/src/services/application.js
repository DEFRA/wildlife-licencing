import { APIRequests } from './api-requests.js'
import db from 'debug'
import { clearPageData } from './cache-operations.js'
const debug = db('web-service:application-service')

// This will be replaced by a selected type
const TYPE = { desc: 'A24 Badger', key: '9d62e5b8-9c77-ec11-8d21-000d3a87431b' }
const PURPOSE = { desc: 'Development', key: '3db073af-201b-ec11-b6e7-0022481a8f18' }

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
    const application = await APIRequests.APPLICATION.create(TYPE.key, PURPOSE.key)
    Object.assign(journeyData, { applicationId: application.id })
    await request.cache().setData(journeyData)
    await clearPageData(request)
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
