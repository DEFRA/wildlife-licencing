import { isCompleteOrConfirmed } from '../common/tag-functions.js'
import { eligibilityURIs } from '../../uris.js'
import { getTaskStatus, isTaskStatus } from './licence-type-map.js'
import { tagStatus } from '../../services/api-requests.js'

const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs

export const SECTIONS = {
  CHECK_BEFORE_YOU_START: { name: 'check-before-you-start' },
  CONTACT_DETAILS: { name: 'contact-details' },
  PLANNED_WORK_ACTIVITY: { name: 'planned-work-activity' },
  APPLY: { name: 'apply' }
}

export const TASK_NAMES = {
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
  [TASK_NAMES.ELIGIBILITY_CHECK]: {
    uri: r => [tagStatus.COMPLETE, tagStatus.COMPLETE_NOT_CONFIRMED].includes(getTaskStatus(r, TASK_NAMES.ELIGIBILITY_CHECK)) ? ELIGIBILITY_CHECK.uri : LANDOWNER.uri,
    status: r => getTaskStatus(r, TASK_NAMES.ELIGIBILITY_CHECK),
    enabled: r => !isTaskStatus(r, TASK_NAMES.ELIGIBILITY_CHECK, tagStatus.COMPLETE)
  }
}
