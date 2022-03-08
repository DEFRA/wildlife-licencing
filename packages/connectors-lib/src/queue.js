import Config from './config.js'

export const QUEUE = {
  connection: {
    host: Config.redis.host,
    port: Config.redis.port,
    database: Config.redis.database
  }
}
