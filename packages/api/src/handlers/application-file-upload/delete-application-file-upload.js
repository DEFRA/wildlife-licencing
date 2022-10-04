import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  const { uploadId } = context.request.params

  const count = await models.applicationUploads.destroy({
    where: {
      id: uploadId
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
}
