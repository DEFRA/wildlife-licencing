import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-proc.js'

export default async (context, req, h) => {
  const user = await models.users.findByPk(context.request.params.userId)

  if (!user) {
    return h.response().code(404)
  }

  const response = prepareResponse(user.dataValues)

  return h.response(response)
    .type(APPLICATION_JSON)
    .code(200)
}
