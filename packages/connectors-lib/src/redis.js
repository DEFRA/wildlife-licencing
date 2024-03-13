import { createClient } from 'redis'
import Config from './config.js'
import db from 'debug'
import { hide } from './utils.js'
import * as _cloneDeep from 'lodash.clonedeep'
const { default: cloneDeep } = _cloneDeep

const debug = db('connectors-lib:redis')
export const CACHE_EXPIRE_SECONDS = process.env.CACHE_EXPIRE_SECONDS || 3600

let client

export const REDIS = {
  getClient: () => client,
  initialiseConnection: async () => {
    const options = {
      socket: {
        host: Config.redis.host,
        port: Config.redis.port,
        ...(Config.redis.password && { tls: true })
      },
      ...(Config.redis.database && { database: Config.redis.database }),
      ...(Config.redis.password && { password: Config.redis.password })
    }

    const msg = cloneDeep(Config.redis)
    if (Config.redis.password) {
      hide(msg, 'password')
    }

    // Print options -- hide password
    debug(`Redis connections: ${JSON.stringify(msg)}`)

    // Create client
    client = createClient(options)

    // Log events
    client.on('error', err => console.error('Redis Client Error', err))
    client.on('connect', () => debug('Redis connection is connecting...'))
    client.on('ready', () => debug('Redis connection is connected'))
    client.on('end', () => debug('Redis connection has disconnected'))
    client.on('reconnecting', () => debug('Redis connection is reconnecting'))

    // Connect
    await client.connect()
    return Promise.resolve()
  },
  cache: {
    save: async (key, body) => {
      const jsonStr = JSON.stringify(body)
      debug(`Redis SAVE: ${key}: ${jsonStr}`)
      await client.set(key, jsonStr, {
        EX: CACHE_EXPIRE_SECONDS
      })
    },
    restore: async key => {
      const res = await client.get(key, {
        EX: CACHE_EXPIRE_SECONDS
      })
      debug(`Redis RESTORE: ${key}: ${res || 'not-found'}`)
      return res
    },
    delete: async key => {
      debug(`Redis DELETE: ${key}`)
      await client.GETDEL(key)
    },
    keys: async str => client.KEYS(str)
  }
}
