import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './site-proc.js'

export default async (_context, req, h) => {
  try {
    const where = req.query
    const sites = await models.sites.findAll(Object.keys(where).length
      ? {
          include: {
            model: models.siteUsers,
            attributes: [],
            where
          }
        }
      : {})

    const responseBody = sites.map(a => prepareResponse(a.dataValues))
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the SITES table', err)
    throw new Error(err.message)
  }
}
