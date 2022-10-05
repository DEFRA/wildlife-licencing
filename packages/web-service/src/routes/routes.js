import applications from '../pages/applications/applications.js'
import applicationSummary from '../pages/applications/application-summary.js'
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

import { applicantName } from '../pages/contact/applicant/applicant-name.js'
import { applicantNames } from '../pages/contact/applicant/applicant-names.js'
import { applicantUser } from '../pages/contact/applicant/applicant-user.js'
import { applicantEmail } from '../pages/contact/applicant/applicant-email.js'
import { applicantCheckAnswers } from '../pages/contact/applicant/applicant-check-answers.js'
import { applicantOrganisation } from '../pages/contact/applicant/applicant-organisation.js'
import { applicantOrganisations } from '../pages/contact/applicant/applicant-organisations.js'
import { applicantPostcode } from '../pages/contact/applicant/applicant-postcode.js'
import { applicantAddress } from '../pages/contact/applicant/applicant-address.js'
import { applicantAddressForm } from '../pages/contact/applicant/applicant-address-form.js'

import { addAuthorisedPerson } from '../pages/contact/authorised-people/add-authorised-person.js'
import { authorisedPersonName } from '../pages/contact/authorised-people/authorised-person-name.js'
import { authorisedPersonEmail } from '../pages/contact/authorised-people/authorised-person-email.js'
import { authorisedPersonPostcode } from '../pages/contact/authorised-people/authorised-person-postcode.js'
import { authorisedPersonAddress } from '../pages/contact/authorised-people/authorised-person-address.js'
import { authorisedPersonAddressForm } from '../pages/contact/authorised-people/authorised-person-address-form.js'
import { removeAuthorisedPerson } from '../pages/contact/authorised-people/remove-authorised-person.js'

import siteName from '../pages/site/site-name/site-name.js'

import habitatStart from '../pages/habitat/a24/start/habitat-start.js'
import habitatTypes from '../pages/habitat/a24/types/habitat-types.js'
import habitatName from '../pages/habitat/a24/name/habitat-name.js'
import habitatReopen from '../pages/habitat/a24/reopen/habitat-reopen.js'
import habitatEntrances from '../pages/habitat/a24/entrances/habitat-entrances.js'
import habitatActiveEntrances from '../pages/habitat/a24/active-entrances/habitat-active-entrances.js'
import habitatGridRef from '../pages/habitat/a24/grid-ref/habitat-grid-ref.js'
import habitatWorkStart from '../pages/habitat/a24/work-start/habitat-work-start.js'
import habitatWorkEnd from '../pages/habitat/a24/work-end/habitat-work-end.js'
import habitatActivities from '../pages/habitat/a24/activities/habitat-activities.js'
import confirmDelete from '../pages/habitat/a24/confirm-delete/confirm-delete.js'
import checkHabitatAnswers from '../pages/habitat/a24/check-habitat-answers/check-habitat-answers.js'

import ecologistPreviousLicence from '../pages/ecologist-experience/previous-licence/previous-licence.js'
import enterLicenceDetails from '../pages/ecologist-experience/enter-licence-details/enter-licence-details.js'
import enterExperience from '../pages/ecologist-experience/enter-experience/enter-experience.js'
import enterMethods from '../pages/ecologist-experience/enter-methods/enter-methods.js'
import classMitigation from '../pages/ecologist-experience/class-mitigation/class-mitigation.js'
import enterClassMitigationDetails from '../pages/ecologist-experience/enter-class-mitigation-details/enter-class-mitigation-details.js'
import checkEcologistAnswers from '../pages/ecologist-experience/check-ecologist-answers/check-ecologist-answers.js'
import licence from '../pages/ecologist-experience/licence/licence.js'
import removeLicence from '../pages/ecologist-experience/remove-licence/remove-licence.js'

import { signOut } from '../pages/sign-out/sign-out.js'

const routes = [
  ...applications,
  ...applicationSummary,
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
  ...applicantOrganisations,
  ...applicantEmail,
  ...applicantPostcode,
  ...applicantAddress,
  ...applicantAddressForm,
  ...applicantCheckAnswers,
  ...addAuthorisedPerson,
  ...authorisedPersonName,
  ...authorisedPersonEmail,
  ...authorisedPersonPostcode,
  ...authorisedPersonAddress,
  ...authorisedPersonAddressForm,
  ...removeAuthorisedPerson,
  ...siteName,
  ...habitatStart,
  ...habitatName,
  ...habitatActiveEntrances,
  ...habitatGridRef,
  ...habitatTypes,
  ...habitatReopen,
  ...habitatWorkStart,
  ...habitatWorkEnd,
  ...habitatEntrances,
  ...habitatActivities,
  ...checkHabitatAnswers,
  ...ecologistPreviousLicence,
  ...enterLicenceDetails,
  ...enterExperience,
  ...enterMethods,
  ...classMitigation,
  ...enterClassMitigationDetails,
  ...checkEcologistAnswers,
  ...licence,
  ...removeLicence,
  ...confirmDelete,

  signOut,
  ...miscRoutes
]

export default routes
