import applications from '../pages/applications/applications.js'
import login from '../pages/auth/login/login.js'
import register from '../pages/auth/register/register.js'
import miscRoutes from './misc-routes.js'
import {
  consent, consentGranted, eligibilityCheck, eligible, landOwner,
  landOwnerPermission, notEligibleLandowner, notEligibleProject
} from '../pages/eligibility/eligibility.js'

import { tasklist } from '../pages/tasklist/tasklist.js'
import { ecologistName } from '../pages/contact/ecologist/ecologist-name.js'
import { applicantName } from '../pages/contact/applicant/applicant-name.js'

const routes = [
  ...applications,
  ...login,
  ...register,
  ...landOwner,
  ...landOwnerPermission,
  ...consent,
  ...consentGranted,
  ...notEligibleLandowner,
  ...notEligibleProject,
  ...eligibilityCheck,
  ...eligible,
  ...tasklist,
  ...ecologistName,
  ...applicantName,
  ...miscRoutes
]

export default routes
