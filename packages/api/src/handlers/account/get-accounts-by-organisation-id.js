import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './account-proc.js'

/**
 * Simple retrieval of all accounts assigned to a IDM organisation
 * @param context
 * @param req
 * @param h
 * @returns {Promise<*>}
 */
export default async (context, _req, h) => {
  try {
    const accounts = await models.accounts.findAll({ where: { organisationId: context.request.params.organisationId } })
    const responseBody = accounts.map(a => prepareResponse(a.dataValues))
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
