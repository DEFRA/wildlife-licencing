import health from '../pages/health/health.js'
import applications from '../pages/applications/applications.js'
import login from '../pages/auth/login/login.js'
import register from '../pages/auth/register/register.js'
import miscRoutes from './misc-routes.js'

const routes = [
  ...health,
  ...applications,
  ...login,
  ...register,
  ...miscRoutes
]

export default routes
