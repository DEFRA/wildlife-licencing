import species from '../pages/species/which-species.js'
import otherSpecies from '../pages/species/other-species.js'
import nsip from '../pages/nsip/nsip.js'
import { windowNotOpen } from '../pages/window-not-open/window-not-open.js'
import applications from '../pages/applications/applications.js'
import feedback from '../pages/feedback/feedback.js'
import feedbackSent from '../pages/feedback/feedback-sent.js'
import applicationSummary from '../pages/applications/application-summary.js'
import applicationLicenceSummary from '../pages/applications/application-licence-summary.js'
import miscRoutes from './misc-routes.js'
import declaration from '../pages/declaration/declaration.js'
import submission from '../pages/submission/submission.js'
import emailConfirmation from '../pages/applications/email-confirmation.js'
import {
  consent, consentGranted, eligibilityCheck, eligible, landOwner,
  landOwnerPermission, notEligibleLandowner, notEligibleProject
} from '../pages/eligibility/eligibility.js'

import cookieInfo from '../pages/cookies/cookie-info.js'
import { tasklist } from '../pages/tasklist/tasklist.js'
import { uploadSupportingInformation } from '../pages/supporting-information/upload-supporting-information.js'
import { checkSupportingInformation } from '../pages/supporting-information/check-supporting-information.js'

import { licenceHolderName } from '../pages/contact/applicant/licence-holder-name.js'
import { applicantEmail } from '../pages/contact/applicant/applicant-email.js'
import { applicantPhoneNumber } from '../pages/contact/applicant/applicant-phone-number.js'
import { licenceHolderCheckAnswers } from '../pages/contact/applicant/licence-holder-check-answers.js'
import { licenceHolderOrganisation } from '../pages/contact/applicant/licence-holder-organisation.js'
import { licenceHolderPostcode } from '../pages/contact/applicant/licence-holder-postcode.js'
import { licenceHolderAddress } from '../pages/contact/applicant/licence-holder-address.js'
import { applicantAddressForm } from '../pages/contact/applicant/applicant-address-form.js'

import { ecologistName } from '../pages/contact/ecologist/ecologist-name.js'
import { ecologistEmail } from '../pages/contact/ecologist/ecologist-email.js'
import { ecologistCheckAnswers } from '../pages/contact/ecologist/ecologist-check-answers.js'
import { ecologistOrganisation } from '../pages/contact/ecologist/ecologist-organisation.js'
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

import { addAdditionalApplicant } from '../pages/contact/additional-contacts/additional-applicant/add-additional-applicant.js'
import { additionalApplicantName } from '../pages/contact/additional-contacts/additional-applicant/additional-applicant-name.js'
import { additionalApplicantEmail } from '../pages/contact/additional-contacts/additional-applicant/additional-applicant-email.js'

import { addAdditionalEcologist } from '../pages/contact/additional-contacts/additional-ecologist/add-additional-ecologist.js'
import { additionalEcologistName } from '../pages/contact/additional-contacts/additional-ecologist/additional-ecologist-name.js'
import { additionalEcologistEmail } from '../pages/contact/additional-contacts/additional-ecologist/additional-ecologist-email.js'

import { additionalEcologistCheckAnswers } from '../pages/contact/additional-contacts/additional-ecologist/additional-ecologist-check-answers.js'
import { additionalApplicantCheckAnswers } from '../pages/contact/additional-contacts/additional-applicant/additional-applicant-check-answers.js'

import workProposal from '../pages/work-activity/work-proposal/work-proposal.js'
import workPayment from '../pages/work-activity/work-payment/work-payment.js'
import workPaymentExemptReason from '../pages/work-activity/work-payment-exempt-reason/work-payment-exempt-reason.js'
import workCategory from '../pages/work-activity/work-category/work-category.js'
import workLicenceCost from '../pages/work-activity/work-licence-cost/work-licence-cost.js'
import checkWorkAnswers from '../pages/work-activity/check-work-answers/check-work-answers.js'

import { invoiceResponsible } from '../pages/contact/invoice/invoice-responsible.js'
import { invoiceName } from '../pages/contact/invoice/invoice-name.js'
import { invoiceEmail } from '../pages/contact/invoice/invoice-email.js'
import { invoiceCheckAnswers } from '../pages/contact/invoice/invoice-check-answers.js'
import { invoiceOrganisation } from '../pages/contact/invoice/invoice-organisation.js'
import { invoicePostcode } from '../pages/contact/invoice/invoice-postcode.js'
import { invoiceAddress } from '../pages/contact/invoice/invoice-address.js'
import { invoiceAddressForm } from '../pages/contact/invoice/invoice-address-form.js'
import { invoiceContactDetails } from '../pages/contact/invoice/invoice-contact-details.js'
import { invoicePurchaseOrder } from '../pages/contact/invoice/invoice-purchase-order.js'

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
import activeSettDropout from '../pages/habitat/a24/active-sett-dropout/active-sett-dropout.js'
import confirmDelete from '../pages/habitat/a24/confirm-delete/confirm-delete.js'
import checkHabitatAnswers from '../pages/habitat/a24/check-habitat-answers/check-habitat-answers.js'

import { onOrNextToDesignatedSite } from '../pages/conservation-considerations/on-or-next-to-designated-site.js'
import designatedSiteStart from '../pages/conservation-considerations/designated-site-start.js'
import designatedSiteName from '../pages/conservation-considerations/designated-site-name.js'

import { designatedSitePermission } from '../pages/conservation-considerations/designated-site-permission.js'
import detailsOfPermission from '../pages/conservation-considerations/details-of-permission.js'
import { adviceFromNaturalEngland } from '../pages/conservation-considerations/advice-from-natural-england.js'
import neActivityAdvice from '../pages/conservation-considerations/ne-activity-advice.js'
import designatedSiteProximity from '../pages/conservation-considerations/designated-site-proximity.js'
import { designatedSiteRemove } from '../pages/conservation-considerations/designated-site-remove.js'
import designatedSiteCheckAnswers from '../pages/conservation-considerations/designated-site-check-answers.js'

import ecologistPreviousLicence from '../pages/ecologist-experience/previous-licence/previous-licence.js'

import enterLicenceDetails from '../pages/ecologist-experience/enter-licence-details/enter-licence-details.js'
import enterExperience from '../pages/ecologist-experience/enter-experience/enter-experience.js'
import enterMethods from '../pages/ecologist-experience/enter-methods/enter-methods.js'
import classMitigation from '../pages/ecologist-experience/class-mitigation/class-mitigation.js'
import enterClassMitigationDetails from '../pages/ecologist-experience/enter-class-mitigation-details/enter-class-mitigation-details.js'
import checkEcologistAnswers from '../pages/ecologist-experience/check-ecologist-answers/check-ecologist-answers.js'
import licence from '../pages/ecologist-experience/licence/licence.js'
import removeLicence from '../pages/ecologist-experience/remove-licence/remove-licence.js'

import anyConvictions from '../pages/conviction/any-conviction/any-convictions.js'
import convictionDetails from '../pages/conviction/conviction-details/conviction-details.js'
import convictionsCheckAnswers from '../pages/conviction/convictions-check-answers/convictions-check-answers.js'

import authority from '../pages/permissions/authority/authority.js'
import permissions from '../pages/permissions/permissions/permissions.js'
import addPermissionStart from '../pages/permissions/add-permission-start/add-permission-start.js'
import whyNoPermission from '../pages/permissions/why-no-permission/why-no-permission.js'
import potentialConflicts from '../pages/permissions/potential-conflicts/potential-conflicts.js'
import permissionConsentType from '../pages/permissions/consent-type/consent-type.js'
import consentReference from '../pages/permissions/consent-reference/consent-reference.js'
import planningType from '../pages/permissions/planning-type/planning-type.js'
import consentRemove from '../pages/permissions/consent-remove/consent-remove.js'
import checkPermissionsAnswers from '../pages/permissions/check-permissions-answers/check-permissions-answers.js'
import wildLifeConditionsMet from '../pages/permissions/conditions-reserved-matters/conditions-reserved-matters.js'
import conditionsNotCompleted from '../pages/permissions/conditions-not-completed/conditions-not-completed.js'
import descPotentialConflicts from '../pages/permissions/describe-potential-conflicts/describe-potential-conflicts.js'
import checkConsentAnswers from '../pages/permissions/check-your-answers/check-your-answers.js'

import userRole from '../pages/user-role/user-role.js'
import { signOut } from '../handlers/sign-out.js'
import { signIn } from '../handlers/defra-idm.js'
import { defraIdmCallback } from '../handlers/defra-idm-callback.js'
import licensedActions from '../pages/returns/licensed-actions.js'
import outcome from '../pages/returns/outcome.js'
import whyNil from '../pages/returns/why-nil.js'
import { anotherLicence } from '../pages/returns/another-licence.js'
import { returnUpload } from '../pages/returns/returns-upload.js'
import { completeWithinDates } from '../pages/returns/complete-within-dates.js'
import whyNotCompletesWithinDates from '../pages/returns/a24/why-not-completes-within-dates.js'
import workStart from '../pages/returns/work-start.js'
import workFinish from '../pages/returns/work-finish.js'
import { oneWayGates } from '../pages/returns/a24/one-way-gates.js'
import { blockingOrProofing } from '../pages/returns/a24/blocking-or-proofing.js'
import { damageByHandOrMechanicalMeans } from '../pages/returns/a24/damage-by-hand-or-mechanical-means.js'
import { destroyVacantSettPage } from '../pages/returns/a24/destroy-vacant-sett.js'
import destroyDate from '../pages/returns/a24/destroy-date.js'
import disturbBadgers from '../pages/returns/a24/disturb-badgers.js'
import artificialSett from '../pages/returns/a24/artificial-sett.js'
import whyNoArtificialSett from '../pages/returns/a24/why-no-artificial-sett.js'
import artificialSettDetails from '../pages/returns/a24/artificial-sett-details.js'
import artificialSettEvidenceFound from '../pages/returns/a24/artificial-sett-evidence-found.js'
import artificialSettGridReference from '../pages/returns/a24/artificial-sett-grid-reference.js'
import { artificialSettCreatedBeforeClosurePage } from '../pages/returns/a24/artificial-sett-created-before-closure.js'
import licenceConditions from '../pages/returns/licence-conditions.js'
import welfareConcerns from '../pages/returns/a24/welfare-concerns.js'
import returnsCheck from '../pages/returns/returns-check.js'
import declarationOfReturns from '../pages/returns/returns-declaration.js'
import { uploadReturnSupportingInformation } from '../pages/returns/returns-upload-file.js'
import { returnUploadedFiles } from '../pages/returns/returns-uploaded-files.js'
import confirmationOfReturns from '../pages/returns/returns-confirmation.js'
import notFound from '../pages/error/not-found.js'

const routes = [
  ...cookieInfo,
  ...species,
  ...otherSpecies,
  ...nsip,
  ...windowNotOpen,
  ...applications,
  ...feedback,
  ...feedbackSent,
  ...applicationSummary,
  ...applicationLicenceSummary,
  ...declaration,
  ...submission,
  ...emailConfirmation,
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
  ...licenceHolderName,
  ...licenceHolderOrganisation,
  ...applicantEmail,
  ...applicantPhoneNumber,
  ...licenceHolderPostcode,
  ...licenceHolderAddress,
  ...applicantAddressForm,
  ...licenceHolderCheckAnswers,
  ...ecologistName,
  ...ecologistOrganisation,
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
  ...additionalApplicantName,
  ...additionalApplicantEmail,
  ...additionalApplicantCheckAnswers,
  ...addAdditionalEcologist,
  ...additionalEcologistName,
  ...additionalEcologistEmail,
  ...additionalEcologistCheckAnswers,
  ...invoiceResponsible,
  ...invoiceName,
  ...invoiceOrganisation,
  ...invoiceEmail,
  ...invoicePostcode,
  ...invoiceAddress,
  ...invoiceAddressForm,
  ...invoiceCheckAnswers,
  ...invoiceContactDetails,
  ...invoicePurchaseOrder,
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
  ...activeSettDropout,
  ...checkHabitatAnswers,
  ...onOrNextToDesignatedSite,
  ...designatedSiteName,
  ...designatedSitePermission,
  ...detailsOfPermission,
  ...adviceFromNaturalEngland,
  ...neActivityAdvice,
  ...designatedSiteProximity,
  ...designatedSiteStart,
  ...designatedSiteCheckAnswers,
  ...designatedSiteRemove,
  ...authority,
  ...ecologistPreviousLicence,
  ...enterLicenceDetails,
  ...enterExperience,
  ...enterMethods,
  ...classMitigation,
  ...enterClassMitigationDetails,
  ...checkEcologistAnswers,

  ...workProposal,
  ...workPayment,
  ...workPaymentExemptReason,
  ...workCategory,
  ...workLicenceCost,
  ...checkWorkAnswers,

  ...licence,
  ...removeLicence,
  ...confirmDelete,
  ...anyConvictions,
  ...convictionsCheckAnswers,
  ...convictionDetails,
  ...permissions,
  ...addPermissionStart,
  ...whyNoPermission,
  ...potentialConflicts,
  ...permissionConsentType,
  ...consentReference,
  ...planningType,
  ...checkPermissionsAnswers,
  ...consentRemove,
  ...wildLifeConditionsMet,
  ...conditionsNotCompleted,
  ...descPotentialConflicts,
  ...checkConsentAnswers,

  ...licensedActions,
  ...outcome,
  ...whyNil,
  ...anotherLicence,
  ...completeWithinDates,
  ...whyNotCompletesWithinDates,
  ...workStart,
  ...workFinish,
  ...oneWayGates,
  ...blockingOrProofing,
  ...damageByHandOrMechanicalMeans,
  ...destroyVacantSettPage,
  ...destroyDate,
  ...disturbBadgers,
  ...artificialSett,
  ...whyNoArtificialSett,
  ...artificialSettDetails,
  ...artificialSettEvidenceFound,
  ...artificialSettGridReference,
  ...artificialSettCreatedBeforeClosurePage,
  ...licenceConditions,
  ...welfareConcerns,
  ...returnUpload,
  ...uploadReturnSupportingInformation,
  ...returnUploadedFiles,
  ...returnsCheck,
  ...declarationOfReturns,
  ...confirmationOfReturns,
  ...notFound,

  signIn,
  signOut,
  ...userRole,
  defraIdmCallback,

  ...miscRoutes
]

export default routes
