import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { prepareResponse, alwaysExclude } from './return-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { licenceId } = context.request.params
    const licence = await models.licences.findByPk(licenceId)

    // If the licence does not exist return a not found and error
    if (!licence) {
      return h.response({ code: 404, error: { description: `licenceId: ${licenceId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const { dataValues } = await models.returns.create({
      id: uuidv4(),
      licenceId: licenceId,
      returnData: alwaysExclude(req.payload),
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/licence/${licenceId}/return/${responseBody.id}`, responseBody)

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into RETURNS table', err)
    throw new Error(err.message)
  }
}
