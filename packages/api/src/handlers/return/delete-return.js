import { REDIS } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { returnId, licenceId } = context.request.params
    const licence = await models.licences.findByPk(licenceId)

    // If the licence does not exist return a not found and error
    if (!licence) {
      return h.response({ code: 404, error: { description: `licenceId: ${licenceId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const count = await models.returns.destroy({
      where: {
        id: returnId
      }
    })
    if (count === 1) {
      // Return no content
      await cache.delete(req.path)
      return h.response().code(204)
    } else {
      // Not found
      return h.response().code(404)
    }
  } catch (err) {
    console.error('Error DELETING from the RETURNS table', err)
    throw new Error(err.message)
  }
}
