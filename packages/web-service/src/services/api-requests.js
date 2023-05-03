import { USER } from './api-requests-user.js'
import { APPLICATION } from './api-requests-application.js'
import { ELIGIBILITY } from './api-requests-eligibility.js'
import { CONTACT } from './api-requests-contact.js'
import { ACCOUNT } from './api-requests-account.js'
import { PERMISSION } from './api-requests-permissions.js'
import { SITE } from './api-requests-site.js'
import { HABITAT } from './api-requests-habitat.js'
import { ECOLOGIST_EXPERIENCE } from './api-requests-ecologist-experience.js'
import { LICENCES } from './api-requests-licences.js'
import { FILE_UPLOAD } from './api-requests-file-upload.js'
import { APPLICATION_TYPES } from './api-requests-application-types.js'
import { DESIGNATED_SITES } from './api-requests-designated-sites.js'

import { boomify } from '@hapi/boom'
import { OTHER } from './api-requests-other.js'

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
  APPLICATION_CONTACTS_CONTACTS: 'application-contacts/contacts',
  ACCOUNTS: '/accounts',
  ACCOUNT: '/account',
  APPLICATION_ACCOUNTS: '/application-accounts',
  APPLICATION_ACCOUNT: '/application-account',
  APPLICATION_ACCOUNTS_ACCOUNTS: 'application-accounts/accounts',
  SITE: '/site',
  SITES: '/sites',
  PERMISSIONS: '/permissions',
  PERMISSIONS_SECTION: '/permissions-section',
  APPLICATION_SITE: '/application-site',
  APPLICATION_SITES: '/application-sites',
  APPLICATION_SITES_SITES: '/application-sites/sites',
  APPLICATION_TYPES: '/application-types',
  DESIGNATED_SITES: 'designated-sites',
  RETURN: '/return'
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
  FILE_UPLOAD,
  APPLICATION_TYPES,
  OTHER,
  PERMISSION,
  DESIGNATED_SITES
}
