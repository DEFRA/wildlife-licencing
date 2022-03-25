import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../../constants.js'
import { SEQUELIZE, REDIS } from '@defra/wls-connectors-lib'
import { clearCaches } from '../application-cache.js'
const { cache } = REDIS

export const putSectionHandler = section => async (context, req, h) => {
  try {
    const { userId, applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the user exists
    if (!application) {
      return h.response().code(404)
    }

    await clearCaches(userId, applicationId)
    const sequelize = SEQUELIZE.getSequelize()

    const [, updatedApplication] = await models.applications.update({
      application: sequelize.fn('jsonb_set', sequelize.col('application'), `{${section}}`, JSON.stringify(req.payload), true),
      updateStatus: 'L'
    }, {
      where: {
        id: applicationId
      },
      returning: ['application']
    })

    const result = updatedApplication[0].dataValues.application[section]

    // Cache
    await cache.save(req.path, result)
    return h.response(result)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error updating the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
