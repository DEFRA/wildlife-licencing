import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'
const { Sequelize } = pkg
const Op = Sequelize.Op

const generalUpsert = async (model, id, json) => {
  await model.upsert({ id, json }) // Possible sequelize bug: created not working with upsert
  return { update: 1 }
}

export const writeApplicationTypes = async obj => {
  const { data, keys } = obj
  const v = Object.values(data)[0]
  return generalUpsert(models.applicationTypes, keys[0].powerAppsKey, {
    name: v?.name,
    description: v?.description,
    refNoSuffix: v?.refNoSuffix
  })
}

export const writeApplicationPurposes = async obj => {
  const { data, keys } = obj
  const v = Object.values(data)[0]
  return generalUpsert(models.applicationPurposes, keys[0].powerAppsKey, {
    name: v?.name,
    description: v?.description
  })
}

export const writeOptionSets = async obj => {
  const { name, values } = obj
  await models.optionSets.upsert({ name, json: values })
  return { update: 1 }
}

export const writeActivities = async obj => {
  const { data, keys } = obj
  const v = Object.values(data)[0]
  return generalUpsert(models.activities, keys[0].powerAppsKey, {
    name: v?.name
  })
}

export const writeMethods = async obj => {
  const { data, keys } = obj
  const v = Object.values(data)[0]
  const json = {
    name: v?.name
  }
  await models.methods.upsert({ option: v?.option, id: keys[0].powerAppsKey, json })
  return { update: 1 }
}

export const writeSpecies = async obj => {
  const { data, keys } = obj
  const id = keys.find(k => k.apiTable === 'species').powerAppsKey
  const speciesSubjectId = keys.find(k => k.apiTable === 'speciesSubject')?.powerAppsKey
  await models.species.upsert({ id, species_subject_id: speciesSubjectId, json: Object.values(data)[0] })
  return { update: 1 }
}

export const writeSpeciesSubject = async obj => {
  const { data, keys } = obj
  const v = Object.values(data)[0]
  return generalUpsert(models.speciesSubject, keys[0].powerAppsKey, {
    name: v?.name
  })
}

export const writeActivityMethods = async ({ keys }) => {
  const activityId = keys.find(k => k.apiTable === 'activities').powerAppsKey
  const methodIds = keys.filter(k => k.apiTable === 'methods').map(k => k.powerAppsKey)
  const activity = await models.activities.findOne({
    where: { id: activityId }
  })

  const methods = await models.methods.findAll({
    where: {
      id: {
        [Op.in]: methodIds
      }
    }
  })

  await activity.setMethods(methods)
  return { update: await activity.countMethods() }
}

export const writeApplicationTypeActivities = async ({ keys }) => {
  const applicationTypeId = keys.find(k => k.apiTable === 'applicationTypes').powerAppsKey
  const activityIds = keys.filter(k => k.apiTable === 'activities').map(k => k.powerAppsKey)

  const applicationType = await models.applicationTypes.findOne({
    where: { id: applicationTypeId }
  })

  const activities = await models.activities.findAll({
    where: {
      id: {
        [Op.in]: activityIds
      }
    }
  })

  await applicationType.setActivities(activities)
  return { update: await applicationType.countActivities() }
}

export const writeApplicationTypeSpecies = async ({ keys }) => {
  const applicationTypeId = keys.find(k => k.apiTable === 'applicationTypes').powerAppsKey
  const speciesIds = keys.filter(k => k.apiTable === 'species').map(k => k.powerAppsKey)

  const applicationType = await models.applicationTypes.findOne({
    where: { id: applicationTypeId }
  })

  const species = await models.species.findAll({
    where: {
      id: {
        [Op.in]: speciesIds
      }
    }
  })

  await applicationType.setSpecies(species)
  return { update: await applicationType.countSpecies() }
}

export const writeApplicationApplicationPurpose = async ({ keys }) => {
  const applicationTypeId = keys.find(k => k.apiTable === 'applicationTypes').powerAppsKey
  const purposeIds = keys.filter(k => k.apiTable === 'applicationPurposes').map(k => k.powerAppsKey)

  const applicationType = await models.applicationTypes.findOne({
    where: { id: applicationTypeId }
  })

  const purposes = await models.applicationPurposes.findAll({
    where: {
      id: {
        [Op.in]: purposeIds
      }
    }
  })
  await applicationType['setApplication-purposes'](purposes)
  return { update: await applicationType['countApplication-purposes']() }
}
