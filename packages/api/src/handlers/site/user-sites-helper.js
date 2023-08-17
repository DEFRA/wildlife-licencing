import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { APPLICATION_JSON } from '../../constants.js'

export default async (_context, req, h) => {
  try {
    const sequelize = SEQUELIZE.getSequelize()
    const userId = req.query.userId

    const qryStr = `select s.id, 
       "a-s".application_id as "applicationId",
        s.site->'name' as "name",
        s.updated_at as "updatedAt"
    from sites s
    join "application-sites" "a-s" on s.id = "a-s".site_id
    where exists (select null from "application-users" "a-u"
    where "a-u".application_id = "a-s".application_id
    and "a-u".user_id = '${userId}')`

    const result = await sequelize.query(qryStr, {
      type: sequelize.QueryTypes.SELECT
    })

    return h
      .response(
        result.map((r) => ({
          ...r,
          updatedAt: r.updatedAt.toISOString()
        }))
      )
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-SITES table', err)
    throw new Error(err.message)
  }
}
