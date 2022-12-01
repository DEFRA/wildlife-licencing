import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { APPLICATION_JSON } from '../../constants.js'

export default async (_context, req, h) => {
  try {
    const sequelize = SEQUELIZE.getSequelize()
    const userId = req.query.userId
    const qryStr = `select a.id,
                           a.clone_of as "cloneOf",
                           a.account->'name' as "name",
                           "a-a".application_id as "applicationId",
                           "a-a".account_role as "accountRole",
                           a.updated_at as "updatedAt",
                           a.submitted
                    from "application-accounts" "a-a"
                             join accounts a on a.id = "a-a".account_id
                             join "application-users" "a-u" on "a-u".application_id = "a-a".application_id
                    where "a-u".user_id = '${userId}'`

    const result = await sequelize.query(qryStr, { type: sequelize.QueryTypes.SELECT })

    return h.response(result.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
      submitted: r.submitted?.toISOString()
    }))).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
