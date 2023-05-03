import { models } from '@defra/wls-database-model'

export default async (context, _req, h) => {
  const { uploadId } = context.request.params

  const count = await models.returnUploads.destroy({
    where: {
      id: uploadId
    }
  })

  return h.response().code(count === 1 ? 204 : 404)
}
