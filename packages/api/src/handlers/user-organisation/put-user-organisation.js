import { models } from '@defra/wls-database-model'
import { prepareResponse } from './organisation-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { userOrganisationId } = context.request.params

    const [userOrganisations, created] = await models.userOrganisations.findOrCreate({
      where: { id: userOrganisationId },
      defaults: {
        id: userOrganisationId,
        userId: req.payload.userId,
        organisationId: req.payload.organisationId,
        relationship: req.payload.relationship
      }
    })

    const responseBody = prepareResponse(userOrganisations.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(created ? 201 : 202)
  } catch (err) {
    console.error('Error INSERTING or UPDATING the USER-ORGANISATION table', err)
    throw new Error(err.message)
  }
}
