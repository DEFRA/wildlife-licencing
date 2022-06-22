import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-contact-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, contactId, contactRole } = req.payload
    const { applicationContactId } = context.request.params

    const application = await models.applications.findByPk(applicationId)
    if (!application) {
      return h.response({ code: 400, error: { description: `applicationId: ${applicationId} not found` } }).code(400)
    }

    const contact = await models.contacts.findByPk(contactId)
    if (!contact) {
      return h.response({ code: 400, error: { description: `contactId: ${contactId} not found` } }).code(400)
    }

    const [applicationContact, created] = await models.applicationContacts.findOrCreate({
      where: { id: applicationContactId },
      defaults: {
        id: applicationContactId,
        applicationId,
        contactId,
        contactRole,
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(applicationContact.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedApplicationContact] = await models.applicationContacts.update({
        applicationId,
        contactId,
        contactRole,
        updateStatus: 'L'
      }, {
        where: {
          id: applicationContactId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedApplicationContact[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the APPLICATION-CONTACTS table', err)
    throw new Error(err.message)
  }
}
