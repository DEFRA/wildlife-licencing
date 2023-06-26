/**
 * This is the location for sections and tasks which appear on the A24 licence.
 */
import {
  countTasksCompleted,
  getTaskStatus,
  hasTaskCompleted,
  hasTaskStatusIn,
  haveTasksCompleted,
  LICENCE_TYPE_TASKLISTS,
  LicenceType
} from './licence-type.js'
import { eligibilityCheckHelper, SECTION_TASKS, SECTIONS, TASKS } from './general-sections.js'
import { tagStatus } from '../../services/status-tags.js'
import { habitatURIs } from '../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { ContactRoles } from '../contact/common/contact-roles.js'

export const A24_SETT = 'setts'
export const A24_SETTS_TASK = {
  name: A24_SETT,
  uri: tags => hasTaskStatusIn(A24_SETT, tags, [tagStatus.COMPLETE, tagStatus.COMPLETE_NOT_CONFIRMED, tagStatus.ONE_COMPLETE_AND_REST_IN_PROGRESS])
    ? habitatURIs.CHECK_YOUR_ANSWERS.uri
    : habitatURIs.START.uri,
  status: tags => getTaskStatus(A24_SETT, tags) || eligibilityCheckHelper(tags),
  enabled: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags)
}

const submissionDependsOn = [
  SECTION_TASKS.ELIGIBILITY_CHECK,
  SECTION_TASKS.LICENCE_HOLDER,
  SECTION_TASKS.ECOLOGIST,
  SECTION_TASKS.AUTHORISED_PEOPLE,
  SECTION_TASKS.ADDITIONAL_CONTACTS,
  SECTION_TASKS.INVOICE_PAYER,
  SECTION_TASKS.WORK_ACTIVITY,
  SECTION_TASKS.PERMISSIONS,
  SECTION_TASKS.CONSERVATION,
  SECTION_TASKS.SITES,
  A24_SETT,
  SECTION_TASKS.ECOLOGIST_EXPERIENCE,
  SECTION_TASKS.SUPPORTING_INFORMATION,
  SECTION_TASKS.DECLARE_CONVICTIONS
]

const ELIGIBILITY = {
  section: SECTIONS.CHECK_BEFORE_YOU_START,
  tasks: [
    TASKS[SECTION_TASKS.ELIGIBILITY_CHECK]
  ]
}

const CONTACT = {
  section: SECTIONS.CONTACT_DETAILS,
  tasks: [
    TASKS[SECTION_TASKS.LICENCE_HOLDER],
    TASKS[SECTION_TASKS.ECOLOGIST],
    TASKS[SECTION_TASKS.AUTHORISED_PEOPLE],
    TASKS[SECTION_TASKS.ADDITIONAL_CONTACTS],
    TASKS[SECTION_TASKS.INVOICE_PAYER]
  ]
}

const CONTACT_NO_ECOLOGIST = {
  section: SECTIONS.CONTACT_DETAILS,
  tasks: [
    TASKS[SECTION_TASKS.LICENCE_HOLDER],
    TASKS[SECTION_TASKS.AUTHORISED_PEOPLE],
    TASKS[SECTION_TASKS.ADDITIONAL_CONTACTS],
    TASKS[SECTION_TASKS.INVOICE_PAYER]
  ]
}

const CONTACT_NO_APPLICANT = {
  section: SECTIONS.CONTACT_DETAILS,
  tasks: [
    TASKS[SECTION_TASKS.LICENCE_HOLDER],
    TASKS[SECTION_TASKS.AUTHORISED_PEOPLE],
    TASKS[SECTION_TASKS.ADDITIONAL_CONTACTS],
    TASKS[SECTION_TASKS.INVOICE_PAYER]
  ]
}

const WORK_ACTIVITY = {
  section: SECTIONS.PLANNED_WORK_ACTIVITY,
  tasks: [
    TASKS[SECTION_TASKS.WORK_ACTIVITY],
    TASKS[SECTION_TASKS.PERMISSIONS],
    TASKS[SECTION_TASKS.CONSERVATION],
    TASKS[SECTION_TASKS.SITES],
    A24_SETTS_TASK,
    TASKS[SECTION_TASKS.ECOLOGIST_EXPERIENCE],
    TASKS[SECTION_TASKS.SUPPORTING_INFORMATION]
  ]
}

const APPLY = {
  section: SECTIONS.APPLY,
  tasks: [
    TASKS[SECTION_TASKS.DECLARE_CONVICTIONS],
    TASKS[SECTION_TASKS.SUBMIT]({
      status: tags => haveTasksCompleted(submissionDependsOn, tags) ? tagStatus.NOT_STARTED : tagStatus.CANNOT_START,
      enabled: tags => haveTasksCompleted(submissionDependsOn, tags)
    })
  ]
}

export const A24 = new LicenceType({
  name: 'A24 Badger',
  canShowReferenceFunc: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags),
  getProgressFunc: tags => ({ complete: countTasksCompleted(submissionDependsOn, tags), from: submissionDependsOn.length + 1 }), // Add 1 for the apply section
  canSubmitFunc: tags => haveTasksCompleted(submissionDependsOn, tags),
  sectionTasks: [
    ELIGIBILITY,
    CONTACT,
    WORK_ACTIVITY,
    APPLY
  ]
})

const submissionDependsOnNoEcologist = submissionDependsOn.filter(s => s !== SECTION_TASKS.ECOLOGIST)
const submissionDependsOnNoApplicant = submissionDependsOn.filter(s => s !== SECTION_TASKS.LICENCE_HOLDER)

export const A24_AS_ECOLOGIST = new LicenceType({
  name: 'A24 Badger',
  canShowReferenceFunc: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags),
  getProgressFunc: tags => ({ complete: countTasksCompleted(submissionDependsOnNoEcologist, tags), from: submissionDependsOnNoEcologist.length + 1 }), // Add 1 for the apply section
  canSubmitFunc: tags => haveTasksCompleted(submissionDependsOnNoEcologist, tags),
  sectionTasks: [
    ELIGIBILITY,
    CONTACT_NO_ECOLOGIST,
    WORK_ACTIVITY,
    APPLY
  ]
})

export const A24_AS_APPLICANT = new LicenceType({
  name: 'A24 Badger',
  canShowReferenceFunc: tags => hasTaskCompleted(SECTION_TASKS.ELIGIBILITY_CHECK, tags),
  getProgressFunc: tags => ({ complete: countTasksCompleted(submissionDependsOnNoApplicant, tags), from: submissionDependsOnNoApplicant.length + 1 }), // Add 1 for the apply section
  canSubmitFunc: tags => haveTasksCompleted(submissionDependsOnNoApplicant, tags),
  sectionTasks: [
    ELIGIBILITY,
    CONTACT_NO_APPLICANT,
    WORK_ACTIVITY,
    APPLY
  ]
})

Object.freeze(A24)
Object.freeze(A24_AS_ECOLOGIST)
Object.freeze(A24_AS_APPLICANT)

LICENCE_TYPE_TASKLISTS[PowerPlatformKeys.APPLICATION_TYPES.A24] = {
  [ContactRoles.ECOLOGIST]: A24_AS_ECOLOGIST,
  [ContactRoles.APPLICANT]: A24_AS_APPLICANT,
  OTHER: A24
}
