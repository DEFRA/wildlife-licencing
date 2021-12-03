import { models } from '../../model/sequentelize-model.js'
import { APPLICATION_JSON } from '../../constants.js'
import { cache } from '../../services/cache.js'

export default async (context, req, h) => {
  try {
    const user = await models.users.findByPk(context.request.params.userId)

    // Check the user exists
    if (!user) {
      return h.response().code(404)
    }

    // Check cache
    const saved = await cache.restore(req.path)

    if (saved) {
      return h.response(JSON.parse(saved))
        .type(APPLICATION_JSON)
        .code(200)
    }

    const applications = await models.applications.findAll({
      where: {
        userId: context.request.params.userId
      }
    })

    await cache.save(req.path, applications)
    return h.response(applications)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
