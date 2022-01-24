import { cache } from '../../services/cache.js'
import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'

export const getOptionSets = async (context, req, h) => {
  const saved = await cache.restore(req.path)

  if (saved) {
    return h.response(JSON.parse(saved))
      .type(APPLICATION_JSON)
      .code(200)
  }

  const r = await models.optionSets.findAll()
  const response = r.map(r => r.dataValues).reduce((a, c) => ({
    ...a,
    [c.name]: {
      values: c.json,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    }
  }), {})

  // Cache
  await cache.save(req.path, response)
  return h.response(response)
    .type(APPLICATION_JSON)
    .code(200)
}
