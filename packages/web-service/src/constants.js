export const SESSION_TTL_MS_DEFAULT = 3 * 60 * 60 * 1000
export const SESSION_COOKIE_NAME_DEFAULT = 'sid'
export const DEFAULT_ROLE = 'USER' // Will be replaced
export const MAX_FILE_UPLOAD_SIZE_BYTES = parseInt(process.env.MAX_FILE_UPLOAD_SIZE_MB || 30) * 1024 * 1024
export const FILE_UPLOAD_HEADROOM_BYTES = parseInt(process.env.FILE_UPLOAD_HEADROOM_BYTES || 15) * 1024 * 1024
export const CLEANUP_SCANDIR_INTERVAL = parseInt(process.env.CLEANUP_SCANDIR_INTERVAL) || 1000 * 60 * 60 * 24
export const CLEANUP_SCANDIR_DAYS = parseInt(process.env.CLEANUP_SCANDIR_DAYS) || 1
