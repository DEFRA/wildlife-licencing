import Config from './config.js'

export const QUEUE = {
  connection: {
    host: Config.redis.host,
    port: Config.redis.port,
    ...(Config.redis.password && { password: Config.redis.password, tls: true }),
    ...(Config.redis.database && { database: Config.redis.database })
  }
}
