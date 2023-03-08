export const HEALTH = { uri: '/health', page: 'health' }
export const SPECIES = { uri: '/which-species', page: 'which-species' }
export const OTHER_SPECIES = { uri: '/other-species', page: 'other-species' }
export const NSIP = { uri: '/nsip', page: 'nsip' }
export const WINDOW_NOT_OPEN = { uri: '/window-not-open', page: 'window-not-open' }

export const APPLICATIONS = { uri: '/applications', page: 'applications' }
export const APPLICATION_SUMMARY = { uri: '/application-summary', page: 'application-summary' }
export const LOGIN = { uri: '/login', page: 'login' }
export const TASKLIST = { uri: '/tasklist', page: 'tasklist' }
export const DECLARATION = { uri: '/declaration', page: 'declaration' }
export const SUBMISSION = { uri: '/submission', page: 'submission' }
export const REMOVE_FILE_UPLOAD = { uri: '/remove/upload', page: 'check-supporting-information' }

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
  LICENCE: { uri: '/licence', page: 'licence' },
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
  CHECK_YOUR_ANSWERS: { uri: '/check-habitat-answers', page: 'check-habitat-answers' },
  CONFIRM_DELETE: { uri: '/confirm-delete', page: 'confirm-delete' }
}

export const contactURIs = {
  ECOLOGIST: {
    USER: { uri: '/ecologist-user', page: 'ecologist-user' },
    NAMES: { uri: '/ecologist-names', page: 'ecologist-names' },
    NAME: { uri: '/ecologist-name', page: 'ecologist-name' },
    IS_ORGANISATION: { uri: '/ecologist-organisation', page: 'ecologist-organisation' },
    ORGANISATIONS: { uri: '/ecologist-organisations', page: 'ecologist-organisations' },
    EMAIL: { uri: '/ecologist-email', page: 'ecologist-email' },
    CHECK_ANSWERS: { uri: '/ecologist-check-answers', page: 'ecologist-check-answers' },
    POSTCODE: { uri: '/ecologist-postcode', page: 'ecologist-postcode' },
    ADDRESS: { uri: '/ecologist-address', page: 'ecologist-address' },
    ADDRESS_FORM: { uri: '/ecologist-address-form', page: 'ecologist-address-form' }
  },
  APPLICANT: {
    USER: { uri: '/applicant-user', page: 'applicant-user' },
    NAMES: { uri: '/applicant-names', page: 'applicant-names' },
    NAME: { uri: '/applicant-name', page: 'applicant-name' },
    IS_ORGANISATION: { uri: '/applicant-organisation', page: 'applicant-organisation' },
    ORGANISATIONS: { uri: '/applicant-organisations', page: 'applicant-organisations' },
    EMAIL: { uri: '/applicant-email', page: 'applicant-email' },
    CHECK_ANSWERS: { uri: '/applicant-check-answers', page: 'applicant-check-answers' },
    POSTCODE: { uri: '/applicant-postcode', page: 'applicant-postcode' },
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
    USER: { uri: '/invoice-user', page: 'invoice-user' },
    NAMES: { uri: '/invoice-names', page: 'invoice-names' },
    NAME: { uri: '/invoice-name', page: 'invoice-name' },
    IS_ORGANISATION: { uri: '/invoice-organisation', page: 'invoice-organisation' },
    ORGANISATIONS: { uri: '/invoice-organisations', page: 'invoice-organisations' },
    EMAIL: { uri: '/invoice-email', page: 'invoice-email' },
    CHECK_ANSWERS: { uri: '/invoice-check-answers', page: 'invoice-check-answers' },
    POSTCODE: { uri: '/invoice-postcode', page: 'invoice-postcode' },
    ADDRESS: { uri: '/invoice-address', page: 'invoice-address' },
    ADDRESS_FORM: { uri: '/invoice-address-form', page: 'invoice-address-form' }
  },
  ADDITIONAL_APPLICANT: {
    ADD: { uri: '/add-additional-applicant', page: 'add-additional-applicant' },
    USER: { uri: '/additional-applicant-user', page: 'additional-applicant-user' },
    NAMES: { uri: '/additional-applicant-names', page: 'additional-applicant-names' },
    NAME: { uri: '/additional-applicant-name', page: 'additional-applicant-name' },
    EMAIL: { uri: '/additional-applicant-email', page: 'additional-applicant-email' },
    CHECK_ANSWERS: { uri: '/additional-contact-check-answers', page: 'additional-contact-check-answers' }
  },
  ADDITIONAL_ECOLOGIST: {
    ADD: { uri: '/add-additional-ecologist', page: 'add-additional-ecologist' },
    USER: { uri: '/additional-ecologist-user', page: 'additional-ecologist-user' },
    NAMES: { uri: '/additional-ecologist-names', page: 'additional-ecologist-names' },
    NAME: { uri: '/additional-ecologist-name', page: 'additional-ecologist-name' },
    EMAIL: { uri: '/additional-ecologist-email', page: 'additional-ecologist-email' },
    CHECK_ANSWERS: { uri: '/additional-contact-check-answers', page: 'additional-contact-check-answers' }
  }
}

export const siteURIs = {
  NAME: { uri: '/site-name', page: 'site-name' },
  SITE_GOT_POSTCODE: { uri: '/site-got-postcode', page: 'site-got-postcode' },
  SELECT_ADDRESS: { uri: '/select-address', page: 'select-address' },
  ADDRESS_NO_LOOKUP: { uri: '/site-address-no-lookup', page: 'site-address-no-lookup' },
  UPLOAD_MAP: { uri: '/upload-map', page: 'upload-map' },
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

export const SIGN_OUT = { uri: '/sign-out', page: 'sign-out' }

export const ERRORS = {
  NOT_FOUND: { page: 'not-found' },
  SERVICE_ERROR: { page: 'service-error' }
}

export const FILE_UPLOADS = {
  SUPPORTING_INFORMATION: {
    FILE_UPLOAD: { uri: '/upload-supporting-information', page: 'upload-supporting-information' },
    CHECK_YOUR_ANSWERS: { uri: '/check-supporting-information', page: 'check-supporting-information' }
  }
}
