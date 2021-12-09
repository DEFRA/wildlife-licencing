import Config from './config.js'

export const QUEUE = {
  connection: {
    host: Config.queue.host || Config.redis.host,
    port: Config.queue.port || Config.redis.port,
    database: Config.queue.database || Config.redis.database
  }
}
