import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export const getSectionsByUserIdHandler = section => async (context, req, h) => {
  try {
    const { userId } = context.request.params
    const saved = await cache.restore(req.path)
    if (saved) {
      return h.response(JSON.parse(saved))
        .type(APPLICATION_JSON)
        .code(200)
    }

    const applications = await models.applications.findAll({
      where: { userId }
    })

    const result = applications.map(a => a.dataValues.application[section]).filter(a => a)

    // Check the user/applicant exists
    if (!result.length) {
      return h.response().code(404)
    }

    await cache.save(req.path, result)
    return h.response(result)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
