import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { alwaysExclude, prepareResponse } from './return-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { licenceId, returnId } = context.request.params
    const licence = await models.licences.findByPk(licenceId)

    // If the licence does not exist return a not found and error
    if (!licence) {
      return h
        .response({
          code: 404,
          error: { description: `licenceId: ${licenceId} not found` }
        })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const data = alwaysExclude(req.payload)

    const [rec, created] = await models.returns.findOrCreate({
      where: { id: returnId },
      defaults: {
        licenceId: licenceId,
        returnData: data,
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(rec.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(201)
    } else {
      const [, updatedReturn] = await models.returns.update(
        {
          licenceId: licenceId,
          returnData: data,
          updateStatus: 'L'
        },
        {
          where: {
            id: returnId
          },
          returning: true
        }
      )
      const responseBody = prepareResponse(updatedReturn[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(200)
    }
  } catch (err) {
    console.error('Error INSERTING or UPDATING into the RETURNS table', err)
    throw new Error(err.message)
  }
}
