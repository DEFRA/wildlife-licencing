import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-site-proc.js'

export default async (_context, req, h) => {
  try {
    const where = req.query
    const applicationSites = await models.applicationSites.findAll(Object.keys(where).length ? { where } : {})
    const responseBody = applicationSites.map(a => prepareResponse(a.dataValues))
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-SITES table', err)
    throw new Error(err.message)
  }
}
