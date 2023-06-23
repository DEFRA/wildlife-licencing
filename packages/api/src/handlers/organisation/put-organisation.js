import { models } from '@defra/wls-database-model'
import { prepareResponse } from './organisation-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { organisationId } = context.request.params

    const [userRole, created] = await models.organisations.findOrCreate({
      where: { id: organisationId },
      defaults: {
        id: organisationId,
        name: req.payload.name,
        organisation: req.payload.organisation
      }
    })

    const responseBody = prepareResponse(userRole.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(created ? 201 : 202)
  } catch (err) {
    console.error('Error INSERTING or UPDATING the ORGANISATION table', err)
    throw new Error(err.message)
  }
}
