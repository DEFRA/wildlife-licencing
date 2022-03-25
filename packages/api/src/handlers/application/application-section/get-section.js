import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export const getSectionHandler = section => async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const saved = await cache.restore(req.path)
    if (saved) {
      return h.response(JSON.parse(saved))
        .type(APPLICATION_JSON)
        .code(200)
    }

    const result = await models.applications.findByPk(applicationId)

    // Check the user exists
    if (!result) {
      return h.response().code(404)
    }

    const res = result.dataValues.application[section] || {}
    await cache.save(req.path, res)
    return h.response(res)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error updating the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
