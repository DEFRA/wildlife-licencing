import { models } from '@defra/wls-database-model'

const generalUpsert = async (model, id, json) => {
  const [, created] = await model.upsert({ id, json })
  return { insert: created ? 1 : 0, update: created ? 0 : 1 }
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
