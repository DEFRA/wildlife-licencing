import { createClient } from 'redis'
import Config from './config.js'

let client

export const REDIS = {
  getClient: () => client,
  initialiseConnection: async () => {
    client = createClient({
      socket: {
        host: Config.redis.host,
        port: Config.redis.port
      }
    })
    await client.connect()
    return Promise.resolve()
  }
}
