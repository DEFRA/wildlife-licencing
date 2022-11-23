import { USER } from './api-requests-user.js'
import { APPLICATION } from './api-requests-application.js'
import { ELIGIBILITY } from './api-requests-eligibility.js'
import { CONTACT } from './api-requests-contact.js'
import { ACCOUNT } from './api-requests-account.js'
import { SITE } from './api-requests-site.js'
import { HABITAT } from './api-requests-habitat.js'
import { ECOLOGIST_EXPERIENCE } from './api-requests-ecologist-experience.js'
import { LICENCES } from './api-requests-licences.js'
import { FILE_UPLOAD } from './api-requests-file-upload.js'

import { boomify } from '@hapi/boom'

export const apiUrls = {
  USERS: '/users',
  USER: '/user',
  APPLICATION: '/application',
  APPLICATIONS: '/applications',
  APPLICATION_USER: '/application-user',
  APPLICATION_USERS: '/application-users',
  CONTACTS: '/contacts',
  CONTACT: '/contact',
  APPLICATION_CONTACTS: '/application-contacts',
  APPLICATION_CONTACT: '/application-contact',
  ACCOUNTS: '/accounts',
  ACCOUNT: '/account',
  APPLICATION_ACCOUNTS: '/application-accounts',
  APPLICATION_ACCOUNT: '/application-account',
  SITE: '/site',
  SITES: '/sites',
  APPLICATION_SITE: '/application-site',
  APPLICATION_SITES: '/application-sites'
}

// These states are common goverment pattern states, and are mirrored in /applications-text.njk
// If you want to read more about the states that should appear on a tasklist page
// Gov.uk docs are here: https://design-system.service.gov.uk/patterns/task-list-pages/
export const tagStatus = {
  // if the user cannot start the task yet
  // for example because another task must be completed first
  CANNOT_START: 'cannot-start',

  // if the user can start work on the task, but has not done so yet
  NOT_STARTED: 'not-started',

  // if the user has started but not completed the task
  IN_PROGRESS: 'in-progress',

  // if the user has gone through the flow once
  // but not clicked "no" on the yes, no radio buttons
  // to confirm they don't want to enter any more information
  // we now can still take them back to the check-your-answers page
  // and so that the tasklist "tag" still shows "In Progress" - https://design-system.service.gov.uk/patterns/task-list-pages/task-list-statuses.png
  COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed',

  // if the user has completed the task
  COMPLETE: 'complete'
}

export const apiRequestsWrapper = async (apiHandler, errorMessage, status) => {
  try {
    return await apiHandler()
  } catch (error) {
    console.error(errorMessage, error)
    boomify(error, { statusCode: status })
    throw error
  }
}

Object.freeze(apiUrls)
Object.freeze(tagStatus)

export const APIRequests = {
  USER,
  APPLICATION,
  ELIGIBILITY,
  CONTACT,
  ACCOUNT,
  SITE,
  HABITAT,
  ECOLOGIST_EXPERIENCE,
  LICENCES,
  FILE_UPLOAD
}
