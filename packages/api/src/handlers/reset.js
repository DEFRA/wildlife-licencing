import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { APPLICATION_JSON } from '../constants.js'

const deletes = [
  'application-contacts',
  'contacts',
  'application-accounts',
  'accounts',
  'application-sites',
  'sites',
  'habitat-sites',
  'application-users',
  'previous-licences',
  'application-uploads',
  'applications'
]

export default async (_context, _req, h) => {
  try {
    const sequelize = SEQUELIZE.getSequelize()
    await Promise.all(deletes.map(d => sequelize.query(`delete from "${d}"`, { type: sequelize.QueryTypes.DELETE })))
    return h.response(deletes).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error resetting', err)
    throw new Error(err.message)
  }
}
