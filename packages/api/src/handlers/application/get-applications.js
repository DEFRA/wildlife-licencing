import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-proc.js'

export default async (_context, req, h) => {
  try {
    const where = req.query
    const applications = await models.applications.findAll(Object.keys(where).length
      ? {
          include: {
            model: models.applicationUsers,
            attributes: [],
            where
          }
        }
      : {})

    const responseBody = applications.map(a => prepareResponse(a.dataValues))
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
