import { models } from '@defra/wls-database-model'

const generalUpsert = async (model, id, json) => {
  await model.upsert({ id, json }) // Possible sequelize bug: created not working with upsert
  return { update: 1 }
}

export const writeApplicationTypes = async obj => {
  const { data, keys } = obj
  const v = Object.values(data)[0]
  return generalUpsert(models.applicationTypes, keys[0].powerAppsKey, {
    name: v?.name,
    description: v?.description
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
