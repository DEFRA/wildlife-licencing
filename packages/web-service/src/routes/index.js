import statusRoutes from './status.js'
import authRoutes from './auth.js'

export default [
  ...Object.values(statusRoutes),
  ...Object.values(authRoutes)
]
