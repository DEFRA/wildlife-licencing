import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './contact-proc.js'

/**
 * Simple retrieval of all contacts assigned to a IDM user
 * @param context
 * @param req
 * @param h
 * @returns {Promise<*>}
 */
export default async (context, req, h) => {
  try {
    const contacts = await models.contacts.findAll({ where: { userId: context.request.params.userId } })
    const responseBody = contacts.map(c => prepareResponse(c.dataValues))
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the CONTACTS table', err)
    throw new Error(err.message)
  }
}
