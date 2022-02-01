import { cache } from '../../services/cache.js'
import { APPLICATION_JSON } from '../../constants.js'

export default (m, keyFunction, responseProcessor) => async (context, req, h) => {
  try {
    const saved = await cache.restore(req.path)

    if (saved) {
      return h.response(JSON.parse(saved))
        .type(APPLICATION_JSON)
        .code(200)
    }

    const entity = await m.findByPk(keyFunction(context.request))

    if (!entity) {
      return h.response().code(404)
    }

    const response = responseProcessor(entity.dataValues)

    // Cache
    await cache.save(req.path, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error(`Error selecting from the ${m.getTableName.toUpperCase()} table`, err)
    throw new Error(err.message)
  }
}
