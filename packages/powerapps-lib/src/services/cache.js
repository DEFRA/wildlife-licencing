import { REDIS } from '@defra/wls-connectors-lib'

/**
 * Load the REDIS reference data cache from each of the reference data read streams
 * @param client
 * @returns {Promise<Object>}
 */
const loadReferenceDataCache = async client => {
  // This is necessary to avoid circular dependency
  const { applicationTypesReadStream, applicationPurposesReadStream } = await import('../read-streams/read-streams.js')
  for (const stream of [applicationTypesReadStream, applicationPurposesReadStream]) {
    const readableStream = stream()
    const cacheValue = []
    let entity
    for await (const obj of readableStream.iterator()) {
      entity = obj.keys[0].powerAppsTable
      const name = Object.values(obj.data).length ? Object.values(obj.data)[0]?.name : null
      if (name) {
        cacheValue.push({ id: obj.keys[0].powerAppsKey, name: Object.values(obj.data)[0].name })
      }
    }
    if (entity) {
      console.log(`Loading reference data cache for entity: ${entity}`)
      await client.set(`ref-data-cache-${entity}`, JSON.stringify(cacheValue), {
        EX: process.env.REFDATA_CACHE_EXPIRE_SECONDS || 24 * 60 * 60 // Default 1 day
      })
    }
  }
}

/**
 * Return the reference data rebuilding the cache if necessary
 * @param entity
 * @returns {Promise<Object>}
 */
const getReferenceData = async entity => {
  const client = REDIS.getClient()
  const refData = await client.get(`ref-data-cache-${entity}`)
  if (refData) {
    return JSON.parse(refData)
  } else {
    await loadReferenceDataCache(client)
    return client.get(`ref-data-cache-${entity}`)
  }
}

/**
 * Look up a reference data item id
 * @param entity
 * @param name
 * @returns {Promise<string|null>}
 */
export const getReferenceDataIdByName = async (entity, name) => {
  const refData = await getReferenceData(entity)
  return refData.find(r => r.name === name)?.id || null
}

/**
 * Look up a reference data item name
 * @param entity
 * @param id
 * @returns {Promise<unknown>}
 */
export const getReferenceDataNameById = async (entity, id) => {
  const refData = await getReferenceData(entity)
  return refData.find(r => r.id === id)?.name || null
}
