import { APIRequests } from './api-requests.js'
import db from 'debug'
const debug = db('web-service:application-service')

// This will be replaced by a selected type
const TYPE = 'A24 Badger'

export const ApplicationService = {
  createApplication: async request => {
    const journeyData = await request.cache().getData()
    const { userId } = journeyData
    const application = await APIRequests.APPLICATION.create(userId, TYPE)
    Object.assign(journeyData, { applicationId: application.id })
    await request.cache().setData(journeyData)
    debug(`Creating new application ${JSON.stringify(application)}`)
    return application.id
  }
}
