import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './return-proc.js'

export default async (context, _req, h) => {
  try {
    const { licenceId } = context.request.params
    const licence = await models.licences.findByPk(licenceId)

    // If the licence does not exist return a not found and error
    if (!licence) {
      return h.response({ code: 404, error: { description: `licenceId: ${licenceId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const returns = await models.returns.findAll({
      where: { licenceId: licence.id },
      order: [['createdAt', 'DESC']]
    })

    const responseBody = returns.map(r => prepareResponse(r.dataValues))

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error inserting into RETURNS table', err)
    throw new Error(err.message)
  }
}
