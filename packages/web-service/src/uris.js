export const HEALTH = { uri: '/health', page: 'health' }
export const SPECIES = { uri: '/which-species', page: 'which-species' }
export const OTHER_SPECIES = { uri: '/other-species', page: 'other-species' }
export const NSIP = { uri: '/nationally-significant-infrastructure-project', page: 'nsip' }
export const WINDOW_NOT_OPEN = { uri: '/application-processing-window-warning', page: 'window-not-open' }
export const COOKIE_PREFS = { uri: '/set-cookie-preferences' }
export const COOKIE_INFO = { uri: '/cookie-info', page: 'cookie-info' }

export const SIGN_IN = { uri: '/sign-in' }
export const SIGN_OUT = { uri: '/sign-out', page: 'sign-out' }
export const DEFRA_IDM_CALLBACK = { uri: '/auth-complete' }
export const USER_ROLE = { uri: '/user-role', page: 'user-role' }

export const APPLICATIONS = { uri: '/applications', page: 'applications' }
export const FEEDBACK = { uri: '/feedback', page: 'feedback' }
export const FEEDBACK_SENT = { uri: '/feedback-sent', page: 'feedback-sent' }
export const APPLICATION_SUMMARY = { uri: '/application-summary', page: 'application-summary' }
export const APPLICATION_LICENCE = { uri: '/application-licence-summary', page: 'application-licence-summary' }
export const TASKLIST = { uri: '/tasklist', page: 'tasklist' }
export const DECLARATION = { uri: '/declaration', page: 'declaration' }
export const SUBMISSION = { uri: '/submission', page: 'submission' }
export const EMAIL_CONFIRMATION = { uri: '/email-confirmation', page: 'email-confirmation' }
export const REMOVE_FILE_UPLOAD = { uri: '/remove/upload', page: 'check-supporting-information' }
export const REMOVE_RETURNS_UPLOADED_FILE = { uri: '/remove-returns-uploaded-file', page: 'returns-uploaded-files' }

export const eligibilityURIs = {
  LANDOWNER: { uri: '/landowner', page: 'landowner' },
  LANDOWNER_PERMISSION: { uri: '/landowner-permission', page: 'landowner-permission' },
  CONSENT: { uri: '/consent', page: 'consent' },
  CONSENT_GRANTED: { uri: '/consent-granted', page: 'consent-granted' },
  NOT_ELIGIBLE_LANDOWNER: { uri: '/dropout-landowner', page: 'dropout-landowner' },
  NOT_ELIGIBLE_PROJECT: { uri: '/dropout-consent-granted', page: 'dropout-consent-granted' },
  ELIGIBILITY_CHECK: { uri: '/eligibility-check', page: 'eligibility-check' },
  ELIGIBLE: { uri: '/eligible', page: 'eligible' }
}

export const ecologistExperienceURIs = {
  PREVIOUS_LICENCE: { uri: '/previous-licence', page: 'previous-licence' },
  ENTER_EXPERIENCE: { uri: '/enter-experience', page: 'enter-experience' },
  ENTER_LICENCE_DETAILS: { uri: '/enter-licence-details', page: 'enter-licence-details' },
  LICENCE: { uri: '/previous-individual-badger-licence-details', page: 'licence' },
  CHECK_YOUR_ANSWERS: { uri: '/check-ecologist-answers', page: 'check-ecologist-answers' },
  ENTER_METHODS: { uri: '/enter-methods', page: 'enter-methods' },
  CLASS_MITIGATION: { uri: '/class-mitigation', page: 'class-mitigation' },
  ENTER_CLASS_MITIGATION: { uri: '/enter-class-mitigation-details', page: 'enter-class-mitigation-details' },
  REMOVE_LICENCE: { uri: '/remove-licence', page: 'remove-licence' }
}

export const habitatURIs = {
  START: { uri: '/habitat-start', page: 'habitat-start' },
  NAME: { uri: '/habitat-name', page: 'habitat-name' },
  TYPES: { uri: '/habitat-types', page: 'habitat-types' },
  REOPEN: { uri: '/habitat-reopen', page: 'habitat-reopen' },
  ENTRANCES: { uri: '/habitat-entrances', page: 'habitat-entrances' },
  ACTIVE_ENTRANCES: { uri: '/habitat-active-entrances', page: 'habitat-active-entrances' },
  GRID_REF: { uri: '/habitat-grid-ref', page: 'habitat-grid-ref' },
  WORK_START: { uri: '/habitat-work-start', page: 'habitat-work-start' },
  WORK_END: { uri: '/habitat-work-end', page: 'habitat-work-end' },
  ACTIVITIES: { uri: '/habitat-activities', page: 'habitat-activities' },
  ACTIVE_SETT_DROPOUT: { uri: '/active-sett-dropout', page: 'active-sett-dropout' },
  CHECK_YOUR_ANSWERS: { uri: '/check-habitat-answers', page: 'check-habitat-answers' },
  CONFIRM_DELETE: { uri: '/confirm-delete', page: 'confirm-delete' }
}

export const workActivityURIs = {
  WORK_PROPOSAL: { uri: '/development-description', page: 'work-proposal' },
  PAYING_FOR_LICENCE: { uri: '/payment-exemption-check', page: 'work-payment' },
  PAYMENT_EXEMPT_REASON: { uri: '/payment-exemption-reason', page: 'work-payment-exempt-reason' },
  WORK_CATEGORY: { uri: '/development-type', page: 'work-category' },
  LICENCE_COST: { uri: '/licence-cost', page: 'work-licence-cost' },
  CHECK_YOUR_ANSWERS: { uri: '/check-work-answers', page: 'check-work-answers' }
}

export const contactURIs = {
  ECOLOGIST: {
    NAME: { uri: '/ecologist-name', page: 'ecologist-name' },
    IS_ORGANISATION: { uri: '/ecologist-organisation', page: 'ecologist-organisation' },
    EMAIL: { uri: '/ecologist-email', page: 'ecologist-email' },
    CHECK_ANSWERS: { uri: '/ecologist-check-answers', page: 'ecologist-check-answers' },
    POSTCODE: { uri: '/ecologist-postcode', page: 'ecologist-postcode' },
    ADDRESS: { uri: '/ecologist-address', page: 'ecologist-address' },
    ADDRESS_FORM: { uri: '/ecologist-address-form', page: 'ecologist-address-form' }
  },
  APPLICANT: {
    NAME: { uri: '/licence-holder-name', page: 'applicant-name' },
    IS_ORGANISATION: { uri: '/licence-holder-organisation', page: 'applicant-organisation' },
    EMAIL: { uri: '/licence-holder-email', page: 'applicant-email' },
    PHONE_NUMBER: { uri: '/applicant-phone-number', page: 'applicant-phone-number' },
    CHECK_ANSWERS: { uri: '/licence-holder-check-answers', page: 'applicant-check-answers' },
    POSTCODE: { uri: '/licence-holder-postcode', page: 'applicant-postcode' },
    ADDRESS: { uri: '/applicant-address', page: 'applicant-address' },
    ADDRESS_FORM: { uri: '/applicant-address-form', page: 'applicant-address-form' }
  },
  AUTHORISED_PEOPLE: {
    ADD: { uri: '/add-authorised-person', page: 'add-authorised-person' },
    NAME: { uri: '/authorised-person-name', page: 'authorised-person-name' },
    EMAIL: { uri: '/authorised-person-email', page: 'authorised-person-email' },
    POSTCODE: { uri: '/authorised-person-postcode', page: 'authorised-person-postcode' },
    ADDRESS: { uri: '/authorised-person-address', page: 'authorised-person-address' },
    ADDRESS_FORM: { uri: '/authorised-person-address-form', page: 'authorised-person-address-form' },
    REMOVE: { uri: '/remove-authorised-person', page: 'remove-authorised-person' }
  },
  INVOICE_PAYER: {
    RESPONSIBLE: { uri: '/invoice-responsible', page: 'invoice-responsible' },
    NAME: { uri: '/invoice-name', page: 'invoice-name' },
    IS_ORGANISATION: { uri: '/invoice-organisation', page: 'invoice-organisation' },
    EMAIL: { uri: '/invoice-email', page: 'invoice-email' },
    CHECK_ANSWERS: { uri: '/invoice-check-answers', page: 'invoice-check-answers' },
    CONTACT_DETAILS: { uri: '/invoice-contact-details', page: 'invoice-contact-details' },
    PURCHASE_ORDER: { uri: '/invoice-purchase-order', page: 'invoice-purchase-order' },
    POSTCODE: { uri: '/invoice-postcode', page: 'invoice-postcode' },
    ADDRESS: { uri: '/invoice-address', page: 'invoice-address' },
    ADDRESS_FORM: { uri: '/invoice-address-form', page: 'invoice-address-form' }
  },
  ADDITIONAL_APPLICANT: {
    ADD: { uri: '/add-additional-applicant', page: 'add-additional-applicant' },
    NAME: { uri: '/additional-applicant-name', page: 'additional-applicant-name' },
    EMAIL: { uri: '/additional-applicant-email', page: 'additional-applicant-email' },
    CHECK_ANSWERS: { uri: '/additional-applicant-check-answers', page: 'additional-applicant-check-answers' }
  },
  ADDITIONAL_ECOLOGIST: {
    ADD: { uri: '/add-additional-ecologist', page: 'add-additional-ecologist' },
    NAME: { uri: '/additional-ecologist-name', page: 'additional-ecologist-name' },
    EMAIL: { uri: '/additional-ecologist-email', page: 'additional-ecologist-email' },
    CHECK_ANSWERS: { uri: '/additional-ecologist-check-answers', page: 'additional-ecologist-check-answers' }
  }
}

export const siteURIs = {
  NAME: { uri: '/site-name', page: 'site-name' },
  SITE_GOT_POSTCODE: { uri: '/site-got-postcode', page: 'site-got-postcode' },
  SELECT_ADDRESS: { uri: '/select-address', page: 'select-address' },
  ADDRESS_NO_LOOKUP: { uri: '/site-address-no-lookup', page: 'site-address-no-lookup' },
  UPLOAD_MAP: { uri: '/upload-survey-map', page: 'upload-map' },
  UPLOAD_MAP_MITIGATIONS_DURING_DEVELOPMENT: { uri: '/upload-map-of-mitigations-during-development', page: 'upload-map-of-mitigations-during-development' },
  UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT: { uri: '/upload-map-of-mitigations-after-development', page: 'upload-map-of-mitigations-after-development' },
  SITE_GRID_REF: { uri: '/site-grid-ref', page: 'site-grid-ref' },
  SITE_CHECK: { uri: '/site-check', page: 'site-check' },
  CHECK_SITE_ANSWERS: { uri: '/check-site-answers', page: 'check-site-answers' }
}

export const permissionsURIs = {
  PERMISSIONS: { uri: '/permissions', page: 'permissions' },
  ADD_PERMISSION_START: { uri: '/add-permission-start', page: 'add-permission-start' },
  WHY_NO_PERMISSIONS: { uri: '/why-no-permission', page: 'why-no-permission' },
  POTENTIAL_CONFLICTS: { uri: '/potential-conflicts', page: 'potential-conflicts' },
  DESC_POTENTIAL_CONFLICTS: { uri: '/describe-potential-conflicts', page: 'describe-potential-conflicts' },
  CONSENT_TYPE: { uri: '/consent-type', page: 'consent-type' },
  PLANNING_TYPE: { uri: '/planning-type', page: 'planning-type' },
  PLANNING_AUTHORITY: { uri: '/authority', page: 'authority' },
  CONSENT_REFERENCE: { uri: '/consent-reference', page: 'consent-reference' },
  CONSENT_REMOVE: { uri: '/consent-remove', page: 'consent-remove' },
  CONDITIONS_MET: { uri: '/conditions-reserved-matters', page: 'conditions-reserved-matters' },
  CONDITIONS_NOT_COMPLETED: { uri: '/conditions-not-completed', page: 'conditions-not-completed' },
  CHECK_PERMISSIONS_ANSWERS: { uri: '/check-permissions-answers', page: 'check-permissions-answers' },
  CHECK_YOUR_ANSWERS: { uri: '/check-your-answers', page: 'check-your-answers' }
}

export const conservationConsiderationURIs = {
  DESIGNATED_SITE: { uri: '/on-or-next-to-designated-site', page: 'on-or-next-to-designated-site' },
  DESIGNATED_SITE_START: { uri: '/designated-site-start', page: 'designated-site-start' },
  DESIGNATED_SITE_NAME: { uri: '/designated-site-name', page: 'designated-site-name' },
  OWNER_PERMISSION: { uri: '/designated-site-permission', page: 'designated-site-permission' },
  OWNER_PERMISSION_DETAILS: { uri: '/details-of-permission', page: 'details-of-permission' },
  NE_ADVICE: { uri: '/advice-from-natural-england', page: 'advice-from-natural-england' },
  ACTIVITY_ADVICE: { uri: '/ne-activity-advice', page: 'ne-activity-advice' },
  DESIGNATED_SITE_PROXIMITY: { uri: '/designated-site-proximity', page: 'designated-site-proximity' },
  DESIGNATED_SITE_CHECK_ANSWERS: { uri: '/designated-site-check-answers', page: 'designated-site-check-answers' },
  DESIGNATED_SITE_REMOVE: { uri: '/designated-site-remove', page: 'designated-site-remove' }
}

export const convictionsURIs = {
  ANY_CONVICTIONS: { uri: '/any-convictions', page: 'any-convictions' },
  CONVICTION_DETAILS: { uri: '/conviction-details', page: 'conviction-details' },
  CHECK_CONVICTIONS_ANSWERS: { uri: '/convictions-check-answers', page: 'convictions-check-answers' }
}

export const ReturnsURIs = {
  NIL_RETURN: { uri: '/did-you-carry-out-licensed-actions', page: 'licensed-actions' },
  OUTCOME: { uri: '/outcome', page: 'outcome' },
  WHY_NIL: { uri: '/reason-actions-not-done', page: 'why-nil' },
  ANOTHER_LICENCE: { uri: '/another-licence', page: 'another-licence' },
  COMPLETE_WITHIN_DATES: { uri: '/complete-within-dates', page: 'complete-within-dates' },
  WORK_START: { uri: '/date-work-started', page: 'work-start' },
  WORK_END: { uri: '/date-work-finished', page: 'work-finish' },
  LICENCE_CONDITIONS: { uri: '/licence-conditions', page: 'licence-conditions' },
  CHECK_YOUR_ANSWERS: { uri: '/returns-check', page: 'returns-check' },
  DECLARATION: { uri: '/returns-declaration', page: 'returns-declaration' },
  CONFIRMATION: { uri: '/returns-confirmation', page: 'returns-confirmation' },
  UPLOAD: { uri: '/returns-upload', page: 'returns-upload' },
  UPLOAD_FILE: { uri: '/returns-upload-file', page: 'returns-upload-file' },
  UPLOADED_FILES_CHECK: { uri: '/returns-uploaded-files', page: 'returns-uploaded-files' },

  A24: {
    DISTURB_BADGERS: { uri: '/a24/disturb-badgers', page: 'disturb-badgers' },
    ONE_WAY_GATES: { uri: '/a24/one-way-gates', page: 'one-way-gates' },
    BLOCKING_OR_PROOFING: { uri: '/a24/blocking-or-proofing', page: 'blocking-or-proofing' },
    DAMAGE_BY_HAND_OR_MECHANICAL_MEANS: { uri: '/a24/damage-by-hand-or-mechanical-means', page: 'damage-by-hand-or-mechanical-means' },
    DESTROY_VACANT_SETT: { uri: '/a24/destroy-vacant-sett', page: 'destroy-vacant-sett' },
    DESTROY_DATE: { uri: '/a24/destroy-date', page: 'destroy-date' },
    ARTIFICIAL_SETT: { uri: '/a24/artificial-sett', page: 'artificial-sett' },
    WHY_NO_ARTIFICIAL_SETT: { uri: '/a24/why-no-artificial-sett', page: 'why-no-artificial-sett' },
    ARTIFICIAL_SETT_DETAILS: { uri: '/a24/artificial-sett-details', page: 'artificial-sett-details' },
    ARTIFICIAL_SETT_EVIDENCE_FOUND: { uri: '/a24/artificial-sett-evidence-found', page: 'artificial-sett-evidence-found' },
    ARTIFICIAL_SETT_GRID_REFERENCE: { uri: '/a24/artificial-sett-grid-reference', page: 'artificial-sett-grid-reference' },
    ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE: { uri: '/a24/artificial-sett-created-before-closure', page: 'artificial-sett-created-before-closure' },
    WHY_NOT_COMPLETE_WITHIN_DATES: { uri: '/why-work-not-completed-within-licence-dates', page: 'why-not-completes-within-dates' },
    WELFARE_CONCERNS: { uri: '/licensed-activity-cause-welfare-concerns', page: 'welfare-concerns' }
  }
}

export const ERRORS = {
  NOT_FOUND: { uri: '/not-found', page: 'not-found' },
  NOT_FOUND_LINK_HOME: { uri: '/not-found?includeHomeLink=true', page: 'not-found' },
  SERVICE_ERROR: { page: 'service-error' }
}

export const FILE_UPLOADS = {
  SUPPORTING_INFORMATION: {
    FILE_UPLOAD: { uri: '/upload-supporting-information', page: 'upload-supporting-information' },
    CHECK_YOUR_ANSWERS: { uri: '/check-supporting-information', page: 'check-supporting-information' }
  }
}
