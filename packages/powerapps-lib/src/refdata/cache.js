import { REDIS } from '@defra/wls-connectors-lib'
import { applicationTypesReadStream, applicationPurposesReadStream } from './refdata-read-stream.js'

const streams = [applicationTypesReadStream, applicationPurposesReadStream]

/**
 * Load the REDIS reference data cache from each of the reference data read streams
 * @param client
 * @returns {Promise<Object>}
 */
const loadReferenceDataCache = async client => {
  for (const stream of streams) {
    const readableStream = stream()
    const cacheValue = []
    let entity
    for await (const obj of readableStream.iterator()) {
      entity = Object.keys(obj.keys)[0]
      cacheValue.push({ id: obj.keys[entity].eid, name: obj.data.name })
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
