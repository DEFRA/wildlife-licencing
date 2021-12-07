import { models } from '../../model/sequentelize-model.js'
import { clearCaches } from './application-cache.js'

export default async (context, req, h) => {
  const { userId, applicationId } = context.request.params
  await clearCaches(userId, applicationId)
  const count = await models.applications.destroy({
    where: {
      id: applicationId
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
