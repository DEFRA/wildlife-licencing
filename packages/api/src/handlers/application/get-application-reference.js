import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, _req, h) => {
  const result = await models.getApplicationRef()
  return h.response({ ref: result[0].nextval })
    .type(APPLICATION_JSON)
    .code(200)
}
