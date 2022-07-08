import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-contact-proc.js'
import { v4 as uuidv4 } from 'uuid'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { applicationId, contactId, contactRole } = req.payload
    const application = await models.applications.findByPk(applicationId)
    if (!application) {
      return h.response({ code: 400, error: { description: `applicationId: ${applicationId} not found` } }).code(400)
    }

    const contact = await models.contacts.findByPk(contactId)
    if (!contact) {
      return h.response({ code: 400, error: { description: `contactId: ${contactId} not found` } }).code(400)
    }

    // If the user-application-site already exists then return a conflict and error
    const applicationContact = await models.applicationContacts.findOne({
      where: { applicationId, contactId, contactRole }
    })

    if (applicationContact) {
      return h.response({
        code: 409,
        error: {
          description: 'an application-contact already exists for applicationId: ' +
            `${applicationId}, contactId: ${contactId} and role: ${contactRole}`
        }
      })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const { dataValues } = await models.applicationContacts.create({
      id: uuidv4(),
      applicationId,
      contactId,
      contactRole
    })

    const response = prepareResponse(dataValues)
    await cache.save(`/application-contact/${dataValues.id}`, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATION-CONTACT table', err)
    throw new Error(err.message)
  }
}
