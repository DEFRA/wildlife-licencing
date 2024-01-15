import { models } from '@defra/wls-database-model'
import { prepareResponse } from './organisation-proc.js'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, _req, h) => {
  try {
    const { organisationId } = context.request.params
    const organisation = await models.organisations.findByPk(organisationId)
    if (!organisation) {
      return h.response().code(404)
    }
    const responseBody = prepareResponse(organisation.dataValues)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error SELECTING from the ORGANISATION table', err)
    throw new Error(err.message)
  }
}
