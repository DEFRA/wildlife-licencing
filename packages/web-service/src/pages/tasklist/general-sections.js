/**
 * This is the location for sections and tasks which appear on many licence types
 */
import { tagStatus } from '../../services/status-tags.js'
import {
  contactURIs, convictionsURIs,
  DECLARATION,
  ecologistExperienceURIs,
  eligibilityURIs,
  FILE_UPLOADS,
  siteURIs,
  permissionsURIs,
  conservationConsiderationURIs,
  workActivityURIs
} from '../../uris.js'
import {
  getTaskStatus,
  hasTaskCompleted,
  hasTaskCompletedOrCompletedNotConfirmed, haveTasksCompleted
} from './licence-type.js'

const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs

export const SECTIONS = {
  CHECK_BEFORE_YOU_START: { name: 'check-before-you-start' },
  CONTACT_DETAILS: { name: 'contact-details' },
  PLANNED_WORK_ACTIVITY: { name: 'planned-work-activity' },
  APPLY: { name: 'apply' }
}

export const SECTION_TASKS = {
  ELIGIBILITY_CHECK: 'eligibility-check',
  APPLICANT: 'applicant',
  ADDITIONAL_APPLICANT: 'additional-applicant',
  ECOLOGIST: 'ecologist',
  ADDITIONAL_ECOLOGIST: 'additional-ecologist',
  INVOICE_PAYER: 'invoice-payer',
  AUTHORISED_PEOPLE: 'authorised-people',
  WORK_ACTIVITY: 'work-activity',
  PERMISSIONS: 'permissions',
  CONSERVATION: 'conservation',
  SITES: 'sites',
  ECOLOGIST_EXPERIENCE: 'ecologist-experience',
  SUPPORTING_INFORMATION: 'supporting-information',
  DECLARE_CONVICTIONS: 'declare-convictions',
  SUBMIT: 'send-application'
}

export const eligibilityCheckHelper = tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  ? tagStatus.NOT_STARTED
  : tagStatus.CANNOT_START

export const TASKS = {
  [SECTION_TASKS.ELIGIBILITY_CHECK]: {
    name: SECTION_TASKS.ELIGIBILITY_CHECK,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
      ? ELIGIBILITY_CHECK.uri
      : LANDOWNER.uri,
    status: tags => getTaskStatus(SECTION_TASKS.ELIGIBILITY_CHECK, tags) || tagStatus.NOT_STARTED,
    enabled: tags => !hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.APPLICANT]: {
    name: SECTION_TASKS.APPLICANT,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.APPLICANT, tags)
      ? contactURIs.APPLICANT.CHECK_ANSWERS.uri
      : contactURIs.APPLICANT.NAME.uri,
    status: tags => getTaskStatus(SECTION_TASKS.APPLICANT, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.ADDITIONAL_APPLICANT]: {
    name: SECTION_TASKS.ADDITIONAL_APPLICANT,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.ADDITIONAL_APPLICANT, tags)
      ? contactURIs.ADDITIONAL_APPLICANT.CHECK_ANSWERS.uri
      : contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
    status: tags => getTaskStatus(SECTION_TASKS.ADDITIONAL_APPLICANT, tags) || eligibilityCheckHelper(tags),
    enabled: tags => haveTasksCompleted([SECTION_TASKS.APPLICANT], tags)
  },

  [SECTION_TASKS.ECOLOGIST]: {
    name: SECTION_TASKS.ECOLOGIST,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.ECOLOGIST, tags)
      ? contactURIs.ECOLOGIST.CHECK_ANSWERS.uri
      : contactURIs.ECOLOGIST.NAME.uri,
    status: tags => getTaskStatus(SECTION_TASKS.ECOLOGIST, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.ADDITIONAL_ECOLOGIST]: {
    name: SECTION_TASKS.ADDITIONAL_ECOLOGIST,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.ADDITIONAL_ECOLOGIST, tags)
      ? contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri
      : contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
    status: tags => getTaskStatus(SECTION_TASKS.ADDITIONAL_ECOLOGIST, tags) || eligibilityCheckHelper(tags),
    enabled: tags => haveTasksCompleted([SECTION_TASKS.ECOLOGIST], tags)
  },

  [SECTION_TASKS.INVOICE_PAYER]: {
    name: SECTION_TASKS.INVOICE_PAYER,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.INVOICE_PAYER, tags)
      ? contactURIs.INVOICE_PAYER.CHECK_ANSWERS.uri
      : contactURIs.INVOICE_PAYER.RESPONSIBLE.uri,
    status: tags => getTaskStatus(SECTION_TASKS.INVOICE_PAYER, tags) || eligibilityCheckHelper(tags),
    enabled: tags => haveTasksCompleted([SECTION_TASKS.APPLICANT, SECTION_TASKS.ECOLOGIST], tags)
  },

  [SECTION_TASKS.AUTHORISED_PEOPLE]: {
    name: SECTION_TASKS.AUTHORISED_PEOPLE,
    uri: () => contactURIs.AUTHORISED_PEOPLE.ADD.uri,
    status: tags => getTaskStatus(SECTION_TASKS.AUTHORISED_PEOPLE, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.WORK_ACTIVITY]: {
    name: SECTION_TASKS.WORK_ACTIVITY,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.WORK_ACTIVITY, tags)
      ? workActivityURIs.CHECK_YOUR_ANSWERS.uri
      : workActivityURIs.WORK_PROPOSAL.uri,
    status: tags => getTaskStatus(SECTION_TASKS.WORK_ACTIVITY, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.PERMISSIONS]: {
    name: SECTION_TASKS.PERMISSIONS,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.PERMISSIONS, tags)
      ? permissionsURIs.CHECK_YOUR_ANSWERS.uri
      : permissionsURIs.PERMISSIONS.uri,
    status: tags => getTaskStatus(SECTION_TASKS.PERMISSIONS, tags) || eligibilityCheckHelper(tags),
    enabled: tags => haveTasksCompleted([SECTION_TASKS.ELIGIBILITY_CHECK], tags)
  },

  [SECTION_TASKS.CONSERVATION]: {
    name: SECTION_TASKS.CONSERVATION,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.CONSERVATION, tags)
      ? conservationConsiderationURIs.DESIGNATED_SITE_CHECK_ANSWERS.uri
      : conservationConsiderationURIs.DESIGNATED_SITE.uri,
    status: tags => getTaskStatus(SECTION_TASKS.CONSERVATION, tags) || eligibilityCheckHelper(tags),
    enabled: tags => haveTasksCompleted([SECTION_TASKS.ELIGIBILITY_CHECK], tags)
  },

  [SECTION_TASKS.SITES]: {
    name: SECTION_TASKS.SITES,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.SITES, tags)
      ? siteURIs.CHECK_SITE_ANSWERS.uri
      : siteURIs.NAME.uri,
    status: tags => getTaskStatus(SECTION_TASKS.SITES, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.ECOLOGIST_EXPERIENCE]: {
    name: SECTION_TASKS.ECOLOGIST_EXPERIENCE,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.ECOLOGIST_EXPERIENCE, tags)
      ? ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
      : ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
    status: tags => getTaskStatus(SECTION_TASKS.ECOLOGIST_EXPERIENCE, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.SUPPORTING_INFORMATION]: {
    name: SECTION_TASKS.SUPPORTING_INFORMATION,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.SUPPORTING_INFORMATION, tags)
      ? FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri
      : FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri,
    status: tags => getTaskStatus(SECTION_TASKS.SUPPORTING_INFORMATION, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  [SECTION_TASKS.DECLARE_CONVICTIONS]: {
    name: SECTION_TASKS.DECLARE_CONVICTIONS,
    uri: tags => hasTaskCompletedOrCompletedNotConfirmed(SECTION_TASKS.DECLARE_CONVICTIONS, tags)
      ? convictionsURIs.CHECK_CONVICTIONS_ANSWERS.uri
      : convictionsURIs.ANY_CONVICTIONS.uri,
    status: tags => getTaskStatus(SECTION_TASKS.DECLARE_CONVICTIONS, tags) || eligibilityCheckHelper(tags),
    enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
  },

  // Status and enabled functions are provided from the specific licence type
  [SECTION_TASKS.SUBMIT]: ({ status, enabled }) => ({
    name: SECTION_TASKS.SUBMIT,
    uri: () => DECLARATION.uri,
    status,
    enabled
  })
}
