import { createClient } from 'redis'
import Config from './config.js'
import db from 'debug'
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

    // Print options -- hide password
    debug(`Redis options: ${JSON.stringify(
      Object.assign({},
        options, { ...(Config.redis.password && { password: '***' }) }),
      null, 4)}`)

    // Create client
    client = createClient(options)

    // Log events
    await client.on('error', err => console.error('Redis Client Error', err))
    await client.on('connect', () => debug('Redis connection is connecting...'))
    await client.on('ready', () => debug('Redis connection is connected'))
    await client.on('end', () => debug('Redis connection has disconnected'))
    await client.on('reconnecting', () => debug('Redis connection is reconnecting'))

    // Connect
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
