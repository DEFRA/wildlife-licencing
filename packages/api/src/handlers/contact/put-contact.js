import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse, alwaysExclude } from './contact-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { contactId } = context.request.params
    const [contact, created] = await models.contacts.findOrCreate({
      where: { id: context.request.params.contactId },
      defaults: {
        id: contactId,
        contact: alwaysExclude(req.payload),
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(contact.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedContact] = await models.contacts.update({
        contact: alwaysExclude(req.payload),
        updateStatus: 'L'
      }, {
        where: {
          id: contactId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedContact[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the CONTACTS table', err)
    throw new Error(err.message)
  }
}
