import applications from '../pages/applications/applications.js'
import login from '../pages/auth/login/login.js'
import register from '../pages/auth/register/register.js'
import miscRoutes from './misc-routes.js'
import declaration from '../pages/declaration/declaration.js'
import submisison from '../pages/submission/submission.js'
import {
  consent, consentGranted, eligibilityCheck, eligible, landOwner,
  landOwnerPermission, notEligibleLandowner, notEligibleProject
} from '../pages/eligibility/eligibility.js'

import habitatStart from '../pages/habitat/habitat-start.js'
import habitatTypes from '../pages/habitat/habitat-types.js'
import habitatActions from '../pages/habitat/habitat-actions.js'
import habitatReopening from '../pages/habitat/habitat-reopening.js'
import habitatEntrances from '../pages/habitat/habitat-entrances.js'
import habitatActive from '../pages/habitat/habitat-active.js'
import { tasklist } from '../pages/tasklist/tasklist.js'
import { ecologistName } from '../pages/contact/ecologist/ecologist-name.js'
import { ecologistNames } from '../pages/contact/ecologist/ecologist-names.js'
import { ecologistUser } from '../pages/contact/ecologist/ecologist-user.js'
import { applicantName } from '../pages/contact/applicant/applicant-name.js'
import { applicantNames } from '../pages/contact/applicant/applicant-names.js'
import { applicantUser } from '../pages/contact/applicant/applicant-user.js'

import { signOut } from '../pages/sign-out/sign-out.js'
import { applicantOrganisation } from '../pages/contact/applicant/applicant-organisation.js'
import { ecologistOrganisation } from '../pages/contact/ecologist/ecologist-organisation.js'

const routes = [
  ...applications,
  ...habitatStart,
  ...habitatTypes,
  ...habitatReopening,
  ...habitatEntrances,
  ...habitatActive,
  ...habitatActions,
  ...login,
  ...register,
  ...declaration,
  ...submisison,
  ...landOwner,
  ...landOwnerPermission,
  ...consent,
  ...consentGranted,
  ...notEligibleLandowner,
  ...notEligibleProject,
  ...eligibilityCheck,
  ...eligible,
  ...tasklist,
  ...applicantUser,
  ...applicantName,
  ...applicantNames,
  ...applicantOrganisation,
  ...ecologistUser,
  ...ecologistName,
  ...ecologistNames,
  ...ecologistOrganisation,
  signOut,
  ...miscRoutes
]

export default routes
