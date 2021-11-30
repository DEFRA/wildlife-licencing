import { createClient } from 'redis'
import Config from './config.js'

let client

export const REDIS = {
  getClient: () => client,
  initialiseConnection: async () => {
    client = createClient({
      host: Config.redis.host || 'localhost',
      port: Config.redis.port || 6379
    })
    await client.connect()
  }
}
