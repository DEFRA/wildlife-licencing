import { models } from '../../../../database-model/src/sequentelize-model.js'
import { APPLICATION_JSON } from '../../constants.js'
import { cache } from '../../services/cache.js'
import { prepareResponse } from './application-proc.js'

export default async (context, req, h) => {
  try {
    const { userId } = context.request.params
    const user = await models.users.findByPk(userId)

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
        userId: userId
      }
    })

    const responseBody = applications.map(a => prepareResponse(a.dataValues))

    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
