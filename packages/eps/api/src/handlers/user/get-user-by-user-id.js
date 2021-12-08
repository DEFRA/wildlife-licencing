import { cache } from '../../services/cache.js'
import { APPLICATION_JSON } from '../../constants.js'
import { models } from '../../model/sequentelize-model.js'
import { prepareResponse } from './user-proc.js'

export default async (context, req, h) => {
  const saved = await cache.restore(req.path)

  if (saved) {
    return h.response(JSON.parse(saved))
      .type(APPLICATION_JSON)
      .code(200)
  }

  const user = await models.users.findByPk(context.request.params.userId)

  if (!user) {
    return h.response().code(404)
  }

  const response = prepareResponse(user.dataValues)

  // Cache
  await cache.save(req.path, response)
  return h.response(response)
    .type(APPLICATION_JSON)
    .code(200)
}
