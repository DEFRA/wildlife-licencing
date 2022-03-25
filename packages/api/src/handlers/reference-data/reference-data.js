import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export const prepareResponse = r => Object.assign((({
  createdAt,
  updatedAt,
  json,
  ...l
}) => l)(r), {
  id: r.id,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  ...r.json
})

const getReferenceData = async (context, req, h, model) => {
  const saved = await cache.restore(req.path)

  if (saved) {
    return h.response(JSON.parse(saved))
      .type(APPLICATION_JSON)
      .code(200)
  }

  const r = await model.findAll()
  const response = r.map(t => prepareResponse(t.dataValues))

  // Cache
  await cache.save(req.path, response)
  return h.response(response)
    .type(APPLICATION_JSON)
    .code(200)
}

export const getApplicationTypes = async (context, req, h) => getReferenceData(context, req, h, models.applicationTypes)
export const getApplicationPurposes = async (context, req, h) => getReferenceData(context, req, h, models.applicationPurposes)
