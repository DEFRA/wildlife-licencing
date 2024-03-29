import { APPLICATION_JSON } from '../../constants.js'
import { SEQUELIZE } from '@defra/wls-connectors-lib'

/**
 * Due to the 2 M:M relationships involved a custom query must be used to avoid duplicates
 * @param _context
 * @param req
 * @param h
 * @returns {Promise<*>}
 */
export default async (_context, req, h) => {
  try {
    const sequelize = SEQUELIZE.getSequelize()
    const where = req.query
    const userClause = where.userId ? `and au.user_id = '${where.userId}'` : ''
    const roleClause = where.role ? `and aa.account_role = '${where.role}'` : ''
    const applicationClause = where.applicationId ? `and aa.application_id = '${where.applicationId}'` : ''
    const qryStr = `
      select * from accounts a
         where exists (
          select null from "application-users" au
          join "application-accounts" aa on a.id = aa.account_id
          where aa.application_id = au.application_id
          ${userClause} ${roleClause} ${applicationClause})`

    const result = await sequelize.query(qryStr, { type: sequelize.QueryTypes.SELECT })
    // Response from this query is slightly different to sequelize fetch
    const responseBody = result.map(a => ({
      id: a.id,
      ...a.account,
      cloneOf: a.clone_of,
      createdAt: a.created_at.toISOString(),
      updatedAt: a.updated_at.toISOString(),
      submitted: a.submitted?.toISOString()
    }))

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
