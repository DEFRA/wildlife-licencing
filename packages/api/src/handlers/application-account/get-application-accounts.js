import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './application-account-proc.js'

export default async (_context, req, h) => {
  try {
    const where = req.query
    const applicationAccounts = await models.applicationAccounts.findAll(((where.applicationId || where.role) && {
      where: {
        ...(where.applicationId && { applicationId: where.applicationId }),
        ...(where.role && { accountRole: where.role })
      }
    }))

    const responseBody = applicationAccounts.map(a => prepareResponse(a.dataValues))

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
