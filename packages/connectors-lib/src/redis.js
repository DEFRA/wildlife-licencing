import { createClient } from 'redis'
import Config from './config.js'

let client

export const REDIS = {
  getClient: () => client,
  initialiseConnection: async () => {
    client = createClient(Object.assign({
      socket: {
        host: Config.redis.host,
        port: Config.redis.port
      }
    }, Config.redis.database
      ? {
          database: Config.redis.database
        }
      : {}))
    await client.connect()
    return Promise.resolve()
  }
}
