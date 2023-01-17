import { APIRequests } from './api-requests.js'
import db from 'debug'
import { clearData } from './cache-operations.js'
const debug = db('web-service:application-service')

/**
 * Cache and API operations concerning applications.
 * @type {{
 * switchApplication: (function(*, *): Promise<*>),
 * createApplication: (function(*, *, *): Promise<*>),
 * submitApplication: ((function(*): Promise<void>)|*), associateApplication: (function(*, *): Promise<*>)
 * }}
 */
export const ApplicationService = {
  createApplication: async (request, typeId, purposeId) => {
    const journeyData = await request.cache().getData() || {}
    const application = await APIRequests.APPLICATION.create(typeId, purposeId)
    delete journeyData.additionalContact
    Object.assign(journeyData, { applicationId: application.id })
    await clearData(journeyData)
    await request.cache().setData(journeyData)
    return application
  },
  switchApplication: async (request, id) => {
    const journeyData = await request.cache().getData()
    if (!journeyData.applicationId || (journeyData.applicationId && id !== journeyData.applicationId)) {
      journeyData.applicationId = id
      await clearData(request)
      await request.cache().setData(journeyData)
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
