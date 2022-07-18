import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import pkg from 'sequelize'
const { Sequelize } = pkg
const Op = Sequelize.Op

/**
 * Ensure that the activities, species and methods are allowed for the habitat-site for this application type.
 * The validation of relations is done on the api - it is not reproduced in the queue processor * @param h
 * @param applicationType
 * @param activityId
 * @param speciesId
 * @param methodIds
 * @returns {Promise<null>}
 */
export const validateRelations = async (h, applicationType, activityId, speciesId, methodIds, settType) => {
  let error = null

  const activity = await models.activities.findByPk(activityId)
  const species = await models.species.findByPk(speciesId)
  const methods = await models.methods.findAll({
    where: {
      option: {
        [Op.in]: methodIds
      }
    }
  })

  if (!activity) {
    error = { description: `activityId: ${activityId} not found` }
  } else if (!species) {
    error = { description: `speciesId: ${speciesId} not found` }
  } else if (!methods.length) {
    error = { description: `methodIds: ${methodIds.join(', ')} not found` }
  } else if (!await applicationType.hasActivity(activity)) {
    error = { description: `Invalid activity: ${activityId} for application type: ${applicationType.id}` }
  } else if (!await applicationType.hasSpecies(species)) {
    error = { description: `Invalid species: ${speciesId} for application type: ${applicationType.id}` }
  } else if (!await activity.hasMethods(methods)) {
    error = { description: `Invalid methods: ${methodIds.join(', ')} for activity: ${activity.id}` }
  } else if (applicationType.json.name === 'A24 Badger') {
    const settTypes = await models.optionSets.findByPk('sdds_setttype')
    if (!settTypes.json.map(v => v.value).find(v => v === settType)) {
      error = { description: `Invalid settType: ${settType}` }
    }
  }

  return error
}
