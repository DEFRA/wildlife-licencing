import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../../constants.js'

export const getSectionsHandler =
  (section, keyFunc) => async (_context, req, h) => {
    try {
      const where = req.query
      const applications = await models.applications.findAll(
        Object.keys(where).length
          ? {
              include: {
                model: models.applicationUsers,
                attributes: [],
                where
              }
            }
          : {}
      )

      const result = applications
        .map((a) => ({
          data: Object.assign(a.dataValues.application[section], { id: a.id }),
          keys: a.dataValues.targetKeys
        }))
        .filter((a) => a.data)
        .map((a) => (keyFunc ? Object.assign(a.data, keyFunc(a.keys)) : a.data))

      // Check the applicant exists
      if (!result.length) {
        return h.response().code(404)
      }

      return h.response(result).type(APPLICATION_JSON).code(200)
    } catch (err) {
      console.error('Error selecting the APPLICATIONS table', err)
      throw new Error(err.message)
    }
  }
