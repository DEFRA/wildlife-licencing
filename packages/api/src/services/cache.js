import { REDIS } from '@defra/wls-connectors-lib'
import { CACHE_EXPIRE_SECONDS } from '../constants.js'

export const cache = {
  save: async (key, body) => {
    const client = REDIS.getClient()
    await client.set(key, JSON.stringify(body), {
      EX: CACHE_EXPIRE_SECONDS
    })
  },
  restore: async key => {
    const client = REDIS.getClient()
    return client.get(key, {
      EX: CACHE_EXPIRE_SECONDS
    })
  },
  delete: async key => {
    const client = REDIS.getClient()
    await client.GETDEL(key)
  },
  keys: async str => {
    const client = REDIS.getClient()
    return client.KEYS(str)
  }
}
