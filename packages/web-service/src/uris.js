export const HEALTH = { uri: '/health', page: 'health' }
export const APPLICATIONS = { uri: '/applications', page: 'applications' }
export const LOGIN = { uri: '/login', page: 'login' }
export const REGISTER = { uri: '/register', page: 'register' }
export const TASKLIST = { uri: '/tasklist', page: 'tasklist' }
export const DECLARATION = { uri: '/declaration', page: 'declaration' }
export const SUBMISSION = { uri: '/submission', page: 'submission' }

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

export const contactURIs = {
  ECOLOGIST: {
    USER: { uri: '/ecologist-user', page: 'ecologist-user' },
    NAMES: { uri: '/ecologist-names', page: 'ecologist-names' },
    NAME: { uri: '/ecologist-name', page: 'ecologist-name' },
    IS_ORGANISATION: { uri: '/ecologist-organisation', page: 'ecologist-organisation' }
  },
  APPLICANT: {
    USER: { uri: '/applicant-user', page: 'applicant-user' },
    NAMES: { uri: '/applicant-names', page: 'applicant-names' },
    NAME: { uri: '/applicant-name', page: 'applicant-name' },
    IS_ORGANISATION: { uri: '/applicant-organisation', page: 'applicant-organisation' }
  }
}

export const SIGN_OUT = { uri: '/sign-out', page: 'sign-out' }

export const ERRORS = {
  CLIENT: { page: 'client-error' },
  SERVER: { page: 'server-error' }
}

export const FILE_UPLOADS = {
  WORK_SCHEDULE: {
    FILE_UPLOAD: { uri: '/upload-work-schedule', page: 'upload-work-schedule' },
    CHECK_YOUR_ANSWERS: { uri: '/check-work-schedule', page: 'check-work-schedule' }
  }
}
