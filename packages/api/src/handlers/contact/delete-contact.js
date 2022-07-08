import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  const { contactId } = context.request.params

  // Check there are no application contacts owned by this contact
  const applicationContacts = await models.applicationContacts.findAll({
    where: { contactId }
  })

  if (applicationContacts.length) {
    return h.response().code(409)
  }

  const count = await models.contacts.destroy({
    where: {
      id: contactId
    }
  })
  if (count === 1) {
    // Return no content
    await cache.delete(req.path)
    return h.response().code(204)
  } else {
    // Not found
    return h.response().code(404)
  }
}
