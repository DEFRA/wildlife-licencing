import appRoutes from './app.js'
import statusRoutes from './status.js'
import authRoutes from './auth.js'

export default [
  ...Object.values(appRoutes),
  ...Object.values(statusRoutes),
  ...Object.values(authRoutes)
]
