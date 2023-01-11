import { eligibilityURIs } from '../../uris.js'
import { getTaskStatus, isTaskStatus, hasTaskStatus } from './licence-type.js'
import { tagStatus } from '../../services/status-tags.js'

const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs

export const SECTIONS = {
  CHECK_BEFORE_YOU_START: { name: 'check-before-you-start' },
  CONTACT_DETAILS: { name: 'contact-details' },
  PLANNED_WORK_ACTIVITY: { name: 'planned-work-activity' },
  APPLY: { name: 'apply' }
}

export const SECTION_TASKS = {
  ELIGIBILITY_CHECK: 'eligibility-check',
  LICENCE_HOLDER: 'licence-holder',
  ECOLOGIST: 'ecologist',
  AUTHORISED_PEOPLE: 'authorised-people',
  ADDITIONAL_CONTACTS: 'additional-contacts',
  INVOICE_PAYER: 'invoice-payer',
  WORK_ACTIVITY: 'work-activity',
  PERMISSIONS: 'permissions',
  SITES: 'sites',
  SETTS: 'setts',
  ECOLOGIST_EXPERIENCE: 'ecologist-experience',
  SUPPORTING_INFORMATION: 'supporting-information',
  SUBMIT: 'send-application'
}

export const TASKS = {
  [SECTION_TASKS.ELIGIBILITY_CHECK]: {
    name: SECTION_TASKS.ELIGIBILITY_CHECK,
    uri: async r => await hasTaskStatus(r, SECTION_TASKS.ELIGIBILITY_CHECK, tagStatus.COMPLETE, tagStatus.COMPLETE_NOT_CONFIRMED) ? ELIGIBILITY_CHECK.uri : LANDOWNER.uri,
    status: r => getTaskStatus(r, SECTION_TASKS.ELIGIBILITY_CHECK),
    enabled: r => !isTaskStatus(r, SECTION_TASKS.ELIGIBILITY_CHECK, tagStatus.COMPLETE)
  }
}
