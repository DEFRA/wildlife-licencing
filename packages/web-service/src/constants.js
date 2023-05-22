export const SESSION_TTL_MS_DEFAULT = 3 * 60 * 60 * 1000
export const SESSION_COOKIE_NAME_DEFAULT = 'sid'
export const DEFAULT_ROLE = 'USER' // Will be replaced
export const MAX_FILE_UPLOAD_SIZE_BYTES = (process.env.MAX_FILE_UPLOAD_SIZE_MB || 30) * 1024 * 1024
export const TIMEOUT_MS = (process.env.MAX_FILE_UPLOAD_TIMEOUT_MS || 60000)
