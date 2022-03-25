import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { clearCaches } from './site-cache.js'
import { prepareResponse } from './site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { userId, siteId } = context.request.params
    const user = await models.users.findByPk(context.request.params.userId)

    // Check the user exists
    if (!user) {
      return h.response().code(404)
    }

    await clearCaches(userId, siteId)

    const [site, created] = await models.sites.findOrCreate({
      where: { id: context.request.params.siteId },
      defaults: {
        id: siteId,
        userId: userId,
        site: req.payload,
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(site.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedSite] = await models.sites.update({
        site: req.payload,
        updateStatus: 'L'
      }, {
        where: {
          id: siteId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedSite[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the SITES table', err)
    throw new Error(err.message)
  }
}
