import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../../constants.js'
import { clearCaches } from '../application-cache.js'
import { SEQUELIZE } from '@defra/wls-connectors-lib'

export default async (context, req, h) => {
  try {
    const { userId, applicationId } = context.request.params
    const result = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!result) {
      return h.response().code(404)
    }

    await clearCaches(userId, applicationId)
    const sequelize = SEQUELIZE.getSequelize()

    await sequelize.query('UPDATE applications ' +
      'SET application = application::jsonb - \'applicant\' WHERE id = ?', {
      type: sequelize.QueryTypes.UPDATE,
      replacements: [applicationId]
    })

    return h.response()
      .type(APPLICATION_JSON)
      .code(204)
  } catch (err) {
    console.error('Error updating the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
