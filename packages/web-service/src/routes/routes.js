import species from '../pages/species/which-species.js'
import applications from '../pages/applications/applications.js'
import applicationSummary from '../pages/applications/application-summary.js'
import login from '../pages/auth/login/login.js'
import miscRoutes from './misc-routes.js'
import declaration from '../pages/declaration/declaration.js'
import submission from '../pages/submission/submission.js'
import {
  consent, consentGranted, eligibilityCheck, eligible, landOwner,
  landOwnerPermission, notEligibleLandowner, notEligibleProject
} from '../pages/eligibility/eligibility.js'

import { tasklist } from '../pages/tasklist/tasklist.js'
import { uploadSupportingInformation } from '../pages/supporting-information/upload-supporting-information.js'
import { checkSupportingInformation } from '../pages/supporting-information/check-supporting-information.js'

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

import { ecologistName } from '../pages/contact/ecologist/ecologist-name.js'
import { ecologistNames } from '../pages/contact/ecologist/ecologist-names.js'
import { ecologistUser } from '../pages/contact/ecologist/ecologist-user.js'
import { ecologistEmail } from '../pages/contact/ecologist/ecologist-email.js'
import { ecologistCheckAnswers } from '../pages/contact/ecologist/ecologist-check-answers.js'
import { ecologistOrganisation } from '../pages/contact/ecologist/ecologist-organisation.js'
import { ecologistOrganisations } from '../pages/contact/ecologist/ecologist-organisations.js'
import { ecologistPostcode } from '../pages/contact/ecologist/ecologist-postcode.js'
import { ecologistAddress } from '../pages/contact/ecologist/ecologist-address.js'
import { ecologistAddressForm } from '../pages/contact/ecologist/ecologist-address-form.js'

import { addAuthorisedPerson } from '../pages/contact/authorised-people/add-authorised-person.js'
import { authorisedPersonName } from '../pages/contact/authorised-people/authorised-person-name.js'
import { authorisedPersonEmail } from '../pages/contact/authorised-people/authorised-person-email.js'
import { authorisedPersonPostcode } from '../pages/contact/authorised-people/authorised-person-postcode.js'
import { authorisedPersonAddress } from '../pages/contact/authorised-people/authorised-person-address.js'
import { authorisedPersonAddressForm } from '../pages/contact/authorised-people/authorised-person-address-form.js'
import { removeAuthorisedPerson } from '../pages/contact/authorised-people/remove-authorised-person.js'

import { addAdditionalApplicant } from '../pages/contact/additional-contacts/add-additional-applicant.js'
import { additionalApplicantUser } from '../pages/contact/additional-contacts/additional-applicant-user.js'
import { additionalApplicantName } from '../pages/contact/additional-contacts/additional-applicant-name.js'
import { additionalApplicantNames } from '../pages/contact/additional-contacts/additional-applicant-names.js'
import { additionalApplicantEmail } from '../pages/contact/additional-contacts/additional-applicant-email.js'

import { addAdditionalEcologist } from '../pages/contact/additional-contacts/add-additional-ecologist.js'
import { additionalEcologistUser } from '../pages/contact/additional-contacts/additional-ecologist-user.js'
import { additionalEcologistName } from '../pages/contact/additional-contacts/additional-ecologist-name.js'
import { additionalEcologistNames } from '../pages/contact/additional-contacts/additional-ecologist-names.js'
import { additionalEcologistEmail } from '../pages/contact/additional-contacts/additional-ecologist-email.js'

import { additionalContactCheckAnswers } from '../pages/contact/additional-contacts/additional-contact-check-answers.js'

import { invoiceResponsible } from '../pages/contact/invoice/invoice-responsible.js'
import { invoiceName } from '../pages/contact/invoice/invoice-name.js'
import { invoiceNames } from '../pages/contact/invoice/invoice-names.js'
import { invoiceUser } from '../pages/contact/invoice/invoice-user.js'
import { invoiceEmail } from '../pages/contact/invoice/invoice-email.js'
import { invoiceCheckAnswers } from '../pages/contact/invoice/invoice-check-answers.js'
import { invoiceOrganisation } from '../pages/contact/invoice/invoice-organisation.js'
import { invoiceOrganisations } from '../pages/contact/invoice/invoice-organisations.js'
import { invoicePostcode } from '../pages/contact/invoice/invoice-postcode.js'
import { invoiceAddress } from '../pages/contact/invoice/invoice-address.js'
import { invoiceAddressForm } from '../pages/contact/invoice/invoice-address-form.js'

import siteName from '../pages/site/site-name/site-name.js'
import siteGotPostcode from '../pages/site/site-got-postcode/site-got-postcode.js'
import siteSelectAddress from '../pages/site/select-address/select-address.js'
import siteAddressNoLookup from '../pages/site/site-address-no-lookup/site-address-no-lookup.js'
import { siteMapUpload } from '../pages/site/upload-map/upload-map.js'
import { siteMapUploadTwo } from '../pages/site/upload-map-of-mitigations-during-development/upload-map-of-mitigations-during-development.js'
import { siteMapUploadThree } from '../pages/site/upload-map-of-mitigations-after-development/upload-map-of-mitigations-after-development.js'
import siteGridRef from '../pages/site/site-grid-ref/site-grid-ref.js'
import siteMisMatchCheck from '../pages/site/site-check/site-check.js'
import checkSiteAnswers from '../pages/site/check-site-answers/check-site-answers.js'

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
  ...species,
  ...applications,
  ...applicationSummary,
  ...login,
  ...declaration,
  ...submission,
  ...uploadSupportingInformation,
  ...checkSupportingInformation,
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
  ...ecologistUser,
  ...ecologistName,
  ...ecologistNames,
  ...ecologistOrganisation,
  ...ecologistOrganisations,
  ...ecologistEmail,
  ...ecologistPostcode,
  ...ecologistAddress,
  ...ecologistAddressForm,
  ...ecologistCheckAnswers,
  ...addAuthorisedPerson,
  ...authorisedPersonName,
  ...authorisedPersonEmail,
  ...authorisedPersonPostcode,
  ...authorisedPersonAddress,
  ...authorisedPersonAddressForm,
  ...removeAuthorisedPerson,
  ...addAdditionalApplicant,
  ...additionalApplicantUser,
  ...additionalApplicantNames,
  ...additionalApplicantName,
  ...additionalApplicantEmail,
  ...addAdditionalEcologist,
  ...additionalEcologistUser,
  ...additionalEcologistNames,
  ...additionalEcologistName,
  ...additionalEcologistEmail,
  ...additionalContactCheckAnswers,
  ...invoiceResponsible,
  ...invoiceUser,
  ...invoiceName,
  ...invoiceNames,
  ...invoiceOrganisation,
  ...invoiceOrganisations,
  ...invoiceEmail,
  ...invoicePostcode,
  ...invoiceAddress,
  ...invoiceAddressForm,
  ...invoiceCheckAnswers,
  ...siteName,
  ...siteGotPostcode,
  ...siteSelectAddress,
  ...siteAddressNoLookup,
  ...siteMapUpload,
  ...siteMapUploadTwo,
  ...siteMapUploadThree,
  ...siteGridRef,
  ...siteMisMatchCheck,
  ...checkSiteAnswers,
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
