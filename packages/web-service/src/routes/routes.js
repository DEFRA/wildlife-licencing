import applications from '../pages/applications/applications.js'
import login from '../pages/auth/login/login.js'
import register from '../pages/auth/register/register.js'
import miscRoutes from './misc-routes.js'
import declaration from '../pages/declaration/declaration.js'
import submission from '../pages/submission/submission.js'
import {
  consent, consentGranted, eligibilityCheck, eligible, landOwner,
  landOwnerPermission, notEligibleLandowner, notEligibleProject
} from '../pages/eligibility/eligibility.js'

import { tasklist } from '../pages/tasklist/tasklist.js'
import { uploadMethodStatement } from '../pages/method-statement/upload-method-statement.js'
import { checkMethodStatement } from '../pages/method-statement/check-method-statement.js'

import { ecologistName } from '../pages/contact/ecologist/ecologist-name.js'
import { ecologistNames } from '../pages/contact/ecologist/ecologist-names.js'
import { ecologistUser } from '../pages/contact/ecologist/ecologist-user.js'
import { applicantName } from '../pages/contact/applicant/applicant-name.js'
import { applicantNames } from '../pages/contact/applicant/applicant-names.js'
import { applicantUser } from '../pages/contact/applicant/applicant-user.js'

import { signOut } from '../pages/sign-out/sign-out.js'

import { applicantOrganisation } from '../pages/contact/applicant/applicant-organisation.js'
import { ecologistOrganisation } from '../pages/contact/ecologist/ecologist-organisation.js'
import habitatStart from '../pages/habitat/habitat-start.js'

const routes = [
  ...applications,
  ...login,
  ...register,
  ...declaration,
  ...submission,
  ...uploadMethodStatement,
  ...checkMethodStatement,
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
  ...habitatStart,
  signOut,
  ...miscRoutes
]

export default routes
