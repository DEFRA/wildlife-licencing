import { models } from '@defra/wls-database-model'

const generalUpsert = async (model, id, json) => {
  await model.upsert({ id, json }) // Possible sequelize bug: created not working with upsert
  return { update: 1 }
}

export const writeApplicationTypes = async obj => {
  const { data, keys } = obj
  return generalUpsert(models.applicationTypes, keys.sdds_applicationtypeses.eid, {
    name: data.name,
    description: data.description
  })
}

export const writeApplicationPurposes = async obj => {
  const { data, keys } = obj
  return generalUpsert(models.applicationPurposes, keys.sdds_applicationpurposes.eid, {
    name: data.name,
    description: data.description
  })
}

export const writeOptionSets = async obj => {
  const { name, values } = obj
  await models.optionSets.upsert({ name, json: values })
  return { update: 1 }
}
