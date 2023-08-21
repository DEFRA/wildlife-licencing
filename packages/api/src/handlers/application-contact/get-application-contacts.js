import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './application-contact-proc.js'

export default async (_context, req, h) => {
  try {
    const where = req.query
    const applicationContacts = await models.applicationContacts.findAll(
      (where.applicationId || where.role || where.contactId) && {
        where: {
          ...(where.applicationId && { applicationId: where.applicationId }),
          ...(where.contactId && { contactId: where.contactId }),
          ...(where.role && { contactRole: where.role })
        }
      }
    )

    const responseBody = applicationContacts.map(a =>
      prepareResponse(a.dataValues)
    )

    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-CONTACTS table', err)
    throw new Error(err.message)
  }
}
