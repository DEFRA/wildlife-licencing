import { models } from '../../../../../database-model/src/sequentelize-model.js'
import { cache } from '../../../services/cache.js'
import { APPLICATION_JSON } from '../../../constants.js'
import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { clearCaches } from '../application-cache.js'

export default async (context, req, h) => {
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
      application: sequelize.fn('jsonb_set', sequelize.col('application'), '{applicant}', JSON.stringify(req.payload), true)
    }, {
      where: {
        id: applicationId
      },
      returning: ['application']
    })

    const applicant = updatedApplication[0].dataValues.application.applicant

    // Cache
    await cache.save(req.path, applicant)
    return h.response(applicant)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error updating the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
