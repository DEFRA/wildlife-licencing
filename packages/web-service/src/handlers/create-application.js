import { APIRequests } from '../services/api-requests.js'
import { APPLICATIONS } from '../uris.js'
import db from 'debug'
const debug = db('web-service:create-application')

// This will be replaced by a selected type
const TYPE = 'A24 Badger'

/**
 * On the creation of a new application;
 * (a) If there is an eligibility section in the journey cache, write this into the application, delete it from the cache
 * and proceed to the tasklist page
 * (b) If there is no eligibility section this indicates that the a create application has been initiated from the
 * applications list page so redirect the user to the landowner
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
export default async (request, h) => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  const application = await APIRequests.APPLICATION.create(userId, TYPE)
  Object.assign(journeyData, { applicationId: application.id })
  await request.cache().setData(journeyData)
  debug(`Creating new application ${JSON.stringify(application)}`)
  return h.redirect(APPLICATIONS.uri)
}
