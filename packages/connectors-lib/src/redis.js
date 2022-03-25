import { createClient } from 'redis'
import Config from './config.js'
import db from 'debug'
const debug = db('connectors-lib:redis')
export const CACHE_EXPIRE_SECONDS = process.env.CACHE_EXPIRE_SECONDS || 600

let client

export const REDIS = {
  getClient: () => client,
  initialiseConnection: async () => {
    debug(`Redis host: ${Config.redis.host}`)
    debug(`Redis port: ${Config.redis.port}`)
    debug(`Redis expire time (second): ${CACHE_EXPIRE_SECONDS}`)
    const options = {
      socket: {
        host: Config.redis.host,
        port: Config.redis.port
      },
      ...Config.redis.database ? { database: Config.redis.database } : {}
    }

    client = createClient(options)
    await client.on('error', err => console.error('Redis Client Error', err))
    await client.connect()
    return Promise.resolve()
  },
  cache: {
    save: async (key, body) => {
      const jsonStr = JSON.stringify(body)
      debug(`Redis SAVE: ${key}: ${jsonStr}`)
      await client.set(key, JSON.stringify(body), {
        EX: CACHE_EXPIRE_SECONDS
      })
    },
    restore: async key => {
      const res = await client.get(key, {
        EX: CACHE_EXPIRE_SECONDS
      })
      debug(`Redis RESTORE: ${key}: ${res}`)
      return res
    },
    delete: async key => {
      debug(`Redis DELETE: ${key}`)
      await client.GETDEL(key)
    },
    keys: async str => client.KEYS(str)
  }
}
