import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { APPLICATION_JSON } from '../../constants.js'

export default async (_context, req, h) => {
  try {
    const sequelize = SEQUELIZE.getSequelize()
    const qryStr = `select c.id,
                           c.clone_of as "cloneOf",
                           c.contact->'fullName' as "fullName",
                           c.user_id as "userId",
                           "a-c".contact_role as "contactRole",
                           c.updated_at as "updatedAt",
                           "a-c".application_id as "applicationId",
                           c.submitted
                    from contacts c 
                        join "application-contacts" "a-c" on c.id = "a-c".contact_id
                        join "application-users" "a-u" on "a-u".application_id = "a-c".application_id
                    where "a-u".user_id = '${req.query.userId}'`

    const result = await sequelize.query(qryStr, { type: sequelize.QueryTypes.SELECT })
    return h.response(result.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
      submitted: r.submitted?.toISOString()
    }))).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the CONTACTS table', err)
    throw new Error(err.message)
  }
}
