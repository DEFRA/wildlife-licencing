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
    debug(`Creating new application ${JSON.stringify(application)}`)
    Object.assign(journeyData, { applicationId: application.id })
    await request.cache().setData(journeyData)
    return application.id
  },
  submitApplication: async request => {
    const journeyData = await request.cache().getData()
    const { userId, applicationId } = journeyData
    debug(`Submitting application... userId: ${userId}, applicationId: ${applicationId}`)
    await APIRequests.APPLICATION.submit(userId, applicationId)
  }
}
