import {
  eligibilityURIs,
  contactURIs,
  DECLARATION,
  FILE_UPLOADS,
  habitatURIs,
  ecologistExperienceURIs,
  siteURIs
} from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { CONTACT_COMPLETE } from '../contact/common/check-answers/check-answers.js'

const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs

// Placeholder - the badger mitigation licence
export const A24 = 'A24 Badger'

// The set of tasks for all licence types
export const SECTION_TASKS = {
  ELIGIBILITY_CHECK: 'eligibility-check',
  LICENCE_HOLDER: 'licence-holder',
  ECOLOGIST: 'ecologist',
  AUTHORISED_PEOPLE: 'authorised-people',
  INVOICE_PAYER: 'invoice-payer',
  WORK_ACTIVITY: 'work-activity',
  PERMISSIONS: 'permissions',
  SITES: 'sites',
  SETTS: 'setts',
  ECOLOGIST_EXPERIENCE: 'ecologist-experience',
  SUPPORTING_INFORMATION: 'supporting-information',
  SUBMIT: 'send-application'
}

// The expected status values for tasks
export const STATUS_VALUES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in-progress',
  NOT_STARTED: 'not-started',
  CANNOT_START_YET: 'cannot-start'
}

// Return a progress object containing the number of completed tasks of total tasks )
export const getProgress = status => ({
  completed: Object.values(status).filter(s => s).length,
  from: Object.keys(status).length
})

export const getTaskStatus = async request => {
  const journeyData = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)
  const applicationTags = application.applicationTags || []
  return {
    [SECTION_TASKS.ELIGIBILITY_CHECK]: applicationTags.includes(SECTION_TASKS.ELIGIBILITY_CHECK),
    [SECTION_TASKS.LICENCE_HOLDER]: applicationTags.includes(CONTACT_COMPLETE.APPLICANT),
    [SECTION_TASKS.ECOLOGIST]: applicationTags.includes(CONTACT_COMPLETE.ECOLOGIST),
    [SECTION_TASKS.AUTHORISED_PEOPLE]: applicationTags.includes(CONTACT_COMPLETE.AUTHORISED_PERSON),
    [SECTION_TASKS.INVOICE_PAYER]: applicationTags.includes(CONTACT_COMPLETE.PAYER),
    [SECTION_TASKS.ECOLOGIST_EXPERIENCE]: applicationTags.includes(SECTION_TASKS.ECOLOGIST_EXPERIENCE),
    [SECTION_TASKS.WORK_ACTIVITY]: false,
    [SECTION_TASKS.PERMISSIONS]: false,
    [SECTION_TASKS.SITES]: applicationTags.includes(SECTION_TASKS.SITES),
    [SECTION_TASKS.SETTS]: applicationTags.includes(SECTION_TASKS.SETTS),
    [SECTION_TASKS.SUPPORTING_INFORMATION]: applicationTags.includes(SECTION_TASKS.SUPPORTING_INFORMATION),
    [SECTION_TASKS.SUBMIT]: false
  }
}

// A function to take the static map for a given licence type and decorate it using the current cache state
export const decorateMap = (currentLicenceTypeMap, taskStatus) => currentLicenceTypeMap.sections.map(s => ({
  ...s,
  tasks: s.tasks.map(t => ({
    ...t,
    ...(typeof t.uri === 'function' && {
      uri: t.uri(taskStatus)
    }),
    ...(typeof t.status === 'function' && {
      status: t.status(taskStatus)
    }),
    ...(typeof t.enabled === 'function' && {
      enabled: t.enabled(taskStatus)
    })
  }))
}))

const eligibilityCheckStatus = status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
  ? STATUS_VALUES.NOT_STARTED
  : STATUS_VALUES.CANNOT_START_YET

const eligibilityCheckEnabled = status => status[SECTION_TASKS.ELIGIBILITY_CHECK]

// A map of the sections and tasks by licence type
export const licenceTypeMap = {
  [A24]: {
    sections: [
      {
        name: 'check-before-you-start', // The name of a section, referred on in the template
        tasks: [ // The set of tasks in this section
          {
            name: SECTION_TASKS.ELIGIBILITY_CHECK, // The name of the task within a section, referred to in the template
            uri: status => status[SECTION_TASKS.ELIGIBILITY_CHECK] ? ELIGIBILITY_CHECK.uri : LANDOWNER.uri, // Either a fixed uri or a function of the status to resolve the uri
            status: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
              ? STATUS_VALUES.COMPLETED
              : STATUS_VALUES.NOT_STARTED, // returns a function of request to get the current status
            enabled: status => !status[SECTION_TASKS.ELIGIBILITY_CHECK]
          }
        ]
      },
      {
        name: 'contact-details',
        tasks: [
          {
            name: SECTION_TASKS.LICENCE_HOLDER,
            uri: status => status[SECTION_TASKS.LICENCE_HOLDER] ? contactURIs.APPLICANT.CHECK_ANSWERS.uri : contactURIs.APPLICANT.USER.uri,
            status: status => status[SECTION_TASKS.LICENCE_HOLDER] ? STATUS_VALUES.COMPLETED : STATUS_VALUES.NOT_STARTED,
            enabled: eligibilityCheckEnabled
          },
          {
            name: SECTION_TASKS.ECOLOGIST,
            uri: status => status[SECTION_TASKS.ECOLOGIST] ? contactURIs.ECOLOGIST.CHECK_ANSWERS.uri : contactURIs.ECOLOGIST.USER.uri,
            status: status => status[SECTION_TASKS.ECOLOGIST] ? STATUS_VALUES.COMPLETED : STATUS_VALUES.NOT_STARTED,
            enabled: eligibilityCheckEnabled
          },
          {
            name: SECTION_TASKS.AUTHORISED_PEOPLE,
            uri: contactURIs.AUTHORISED_PEOPLE.ADD.uri,
            status: status => status[SECTION_TASKS.AUTHORISED_PEOPLE] ? STATUS_VALUES.COMPLETED : STATUS_VALUES.NOT_STARTED,
            enabled: eligibilityCheckEnabled
          },
          {
            name: SECTION_TASKS.INVOICE_PAYER,
            uri: contactURIs.INVOICE_PAYER.RESPONSIBLE.uri,
            status: status => status[SECTION_TASKS.INVOICE_PAYER] ? STATUS_VALUES.COMPLETED : STATUS_VALUES.NOT_STARTED,
            enabled: eligibilityCheckEnabled
          }
        ]
      },
      {
        name: 'planned-work-activity',
        tasks: [
          {
            name: SECTION_TASKS.WORK_ACTIVITY,
            uri: '/',
            status: () => STATUS_VALUES.CANNOT_START_YET
          },
          {
            name: SECTION_TASKS.PERMISSIONS,
            uri: '/',
            status: () => STATUS_VALUES.CANNOT_START_YET
          },
          {
            name: SECTION_TASKS.SITES,
            uri: status => status[SECTION_TASKS.SITES]
              ? siteURIs.CHECK_SITE_ANSWERS.uri
              : siteURIs.NAME.uri,
            status: status => status[SECTION_TASKS.SITES]
              ? STATUS_VALUES.COMPLETED
              : eligibilityCheckStatus(status),
            enabled: eligibilityCheckEnabled
          },
          {
            name: SECTION_TASKS.SETTS,
            uri: habitatURIs.START.uri,
            status: status => status[SECTION_TASKS.SETTS]
              ? STATUS_VALUES.COMPLETED
              : eligibilityCheckStatus(status),
            enabled: eligibilityCheckEnabled
          },
          {
            name: SECTION_TASKS.ECOLOGIST_EXPERIENCE,
            uri: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
            status: status => status[SECTION_TASKS.ECOLOGIST_EXPERIENCE]
              ? STATUS_VALUES.COMPLETED
              : eligibilityCheckStatus(status),
            enabled: eligibilityCheckEnabled
          },
          {
            name: SECTION_TASKS.SUPPORTING_INFORMATION,
            uri: status => status[SECTION_TASKS.SUPPORTING_INFORMATION]
              ? FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri
              : FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri,
            status: status => status[SECTION_TASKS.SUPPORTING_INFORMATION]
              ? STATUS_VALUES.COMPLETED
              : eligibilityCheckStatus(status),
            enabled: eligibilityCheckEnabled
          }
        ]
      },
      {
        name: 'apply',
        tasks: [
          {
            name: SECTION_TASKS.SUBMIT,
            uri: DECLARATION.uri,
            status: eligibilityCheckStatus,
            enabled: eligibilityCheckEnabled
          }
        ]
      }
    ]
  }
}
