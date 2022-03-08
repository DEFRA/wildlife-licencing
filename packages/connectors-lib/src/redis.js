import { createClient } from 'redis'
import Config from './config.js'
import db from 'debug'
const debug = db('connectors-lib:db')

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
  }
}
