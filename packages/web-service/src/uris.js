export const HEALTH = { uri: '/health', page: 'health' }
export const APPLICATIONS = { uri: '/applications', page: 'applications' }
export const APPLICATION_SUMMARY = { uri: '/application-summary', page: 'application-summary' }
export const LOGIN = { uri: '/login', page: 'login' }
export const REGISTER = { uri: '/register', page: 'register' }
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
  NOT_ELIGIBLE_PROJECT: { uri: '/dropout-project', page: 'dropout-project' },
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
  }
}

export const siteURIs = {
  NAME: { uri: '/site-name', page: 'site-name' }
}

export const SIGN_OUT = { uri: '/sign-out', page: 'sign-out' }

export const ERRORS = {
  CLIENT: { page: 'client-error' },
  SERVER: { page: 'server-error' }
}

export const FILE_UPLOADS = {
  SUPPORTING_INFORMATION: {
    FILE_UPLOAD: { uri: '/upload-supporting-information', page: 'upload-supporting-information' },
    CHECK_YOUR_ANSWERS: { uri: '/check-supporting-information', page: 'check-supporting-information' }
  }
}
