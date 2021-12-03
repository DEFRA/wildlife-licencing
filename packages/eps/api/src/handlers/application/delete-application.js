import { models } from '../../model/sequentelize-model.js'
import { cache } from '../../services/cache.js'

export default async (context, req, h) => {
  await cache.delete(req.path)
  await cache.delete(`/user/${context.request.params.userId}/applications`)
  const count = await models.applications.destroy({
    where: {
      id: context.request.params.applicationId
    }
  })
  if (count === 1) {
    // Return no content
    return h.response().code(204)
  } else {
    // Not found
    return h.response().code(404)
  }
}
