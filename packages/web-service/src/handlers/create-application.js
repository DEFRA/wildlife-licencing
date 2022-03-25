import { APIRequests } from '../services/api-requests.js'
import { APPLICATIONS } from '../uris.js'
import db from 'debug'
const debug = db('web-service:create-application')

// This will be replaced by a selected type
const TYPE = 'A24 Badger'

export default async (request, h) => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  const application = await APIRequests.APPLICATION.create(userId, TYPE)
  Object.assign(journeyData, { applicationId: application.id })
  await request.cache().setData(journeyData)
  debug(`Creating new application ${JSON.stringify(application)}`)
  return h.redirect(APPLICATIONS.uri)
}
