import { models } from '@defra/wls-database-model'
import { cache } from '../services/cache.js'

// export const utils = async (context, req, h, userId) => {
//   const user = await models.users.findByPk(userId)
//
//   // Check the user exists
//   if (!user) {
//     return h.response().code(404)
//   }
//
//   // Check cache
//   const saved = await cache.restore(req.path)
//
//   if (saved) {
//     return h.response(JSON.parse(saved))
//       .type(APPLICATION_JSON)
//       .code(200)
//   }
//
//   return null
// }

/**
 * Convenience functions
 * @param context
 * @returns {Promise<boolean>}
 */
export const checkUser = async context => !!await models.users.findByPk(context.request.params.userId)
export const checkCache = async req => JSON.parse(await cache.restore(req.path))
