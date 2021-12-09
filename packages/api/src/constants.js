/*
 * Constants
 */
export const SERVER_PORT = process.env.SERVER_PORT || 3000
export const CACHE_EXPIRE_SECONDS = process.env.CACHE_EXPIRE_SECONDS || 600
export const APPLICATION_JSON = 'application/json'

/*
 * Optional parameters for different queue instance
 */
export const QUEUE_HOST = process.env.QUEUE_HOST
export const QUEUE_PORT = process.env.QUEUE_PORT
export const QUEUE_DB = process.env.QUEUE_DB
