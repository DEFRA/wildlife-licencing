import Config from './config.js'
import Queue from 'bull'

export const QUEUE = (connectionOptions) => {
  return {
    createQueues: async queues => {
      const redisOpts = {
        host: connectionOptions.host || Config.redis.host,
        port: connectionOptions.port || Config.redis.port,
        database: connectionOptions.database || Config.redis.database
      }
      return queues.map(({ name, options }) => {
        const mergedOptions = Object.assign(connectionOptions, redisOpts, options)
        return {
          name: name,
          queue: new Queue(name, mergedOptions)
        }
      })
    }
  }
}
