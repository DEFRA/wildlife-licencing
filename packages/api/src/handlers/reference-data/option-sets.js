import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export const getOptionSets = async (context, req, h) => {
  const saved = await cache.restore(req.path)

  if (saved) {
    return h.response(JSON.parse(saved))
      .type(APPLICATION_JSON)
      .code(200)
  }

  const res = await models.optionSets.findAll()
  const response = res.map(r => r.dataValues).reduce((a, c) => ({
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
