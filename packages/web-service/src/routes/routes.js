import health from '../pages/health/health.js'
import applications from '../pages/applications/applications.js'
import login from '../pages/login/login.js'
import miscRoutes from './misc-routes.js'

const routes = [
  ...health,
  ...applications,
  ...login,
  ...miscRoutes
]

export default routes
