import { models } from '@defra/wls-database-model'
import { clearCaches } from '../application-cache.js'
import { SEQUELIZE } from '@defra/wls-connectors-lib'

export const deleteSectionHandler = (section, removeKeyFunc) => async (context, _req, h) => {
  try {
    const { applicationId } = context.request.params
    const result = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!result) {
      return h.response().code(404)
    }

    await clearCaches(applicationId)
    const sequelize = SEQUELIZE.getSequelize()
    let targetKeys = result.dataValues.targetKeys
    if (removeKeyFunc && targetKeys) {
      targetKeys = removeKeyFunc(targetKeys)
    }

    await sequelize.query('UPDATE applications ' +
      `SET application = application::jsonb - '${section}', target_keys = '${JSON.stringify(targetKeys)}' WHERE id = ?`, {
      type: sequelize.QueryTypes.UPDATE,
      replacements: [applicationId]
    })

    return h.response().code(204)
  } catch (err) {
    console.error('Error updating the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
