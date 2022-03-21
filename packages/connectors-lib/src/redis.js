import { createClient } from 'redis'
import Config from './config.js'
import db from 'debug'
import { CACHE_EXPIRE_SECONDS } from '../../api/src/constants.js'
const debug = db('connectors-lib:redis')

let client

export const REDIS = {
  getClient: () => client,
  initialiseConnection: async () => {
    debug(`Redis host: ${Config.redis.host}`)
    debug(`Redis port: ${Config.redis.port}`)
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
    keys: async str => {
      return client.KEYS(str)
    }
  }
}
