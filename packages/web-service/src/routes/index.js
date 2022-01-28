import statusRoutes from './status.js'
import authRoutes from './auth.js'

const routes = [
  ...Object.values(statusRoutes),
  ...Object.values(authRoutes)
]

export default routes
