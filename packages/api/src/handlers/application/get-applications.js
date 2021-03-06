import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-proc.js'

export default async (_context, req, h) => {
  try {
    const where = req.query
    const applications = await models.applications.findAll({
      include: {
        model: models.users,
        attributes: [],
        through: {
          attributes: [],
          ...(where.role && {
            where: { role: where.role }
          })
        },
        ...(where.userId && {
          where: { id: where.userId }
        })
      }
    })

    const responseBody = applications.map(a => prepareResponse(a.dataValues))
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
