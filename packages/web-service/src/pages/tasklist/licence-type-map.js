import { eligibilityURIs, contactURIs, DECLARATION, FILE_UPLOADS } from '../../uris.js'
import { CHECK_COMPLETED } from '../eligibility/eligibility.js'
import { APIRequests } from '../../services/api-requests.js'

const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs
const {
  APPLICANT: { USER: APPLICANT_USER },
  ECOLOGIST: { USER: ECOLOGIST_USER }
} = contactURIs
// Placeholder - the badger mitigation licence
export const A24 = 'A24 Badger'

// The set of tasks for all licence types
export const SECTION_TASKS = {
  ELIGIBILITY_CHECK: 'eligibility-check',
  LICENCE_HOLDER: 'licence-holder',
  ECOLOGIST: 'ecologist',
  WORK_ACTIVITY: 'work-activity',
  PERMISSIONS: 'permissions',
  SITES: 'sites',
  SETTS: 'setts',
  WORK_SCHEDULE: 'work-schedule',
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
  return {
    [SECTION_TASKS.ELIGIBILITY_CHECK]: application?.eligibility?.[CHECK_COMPLETED] || false,
    [SECTION_TASKS.LICENCE_HOLDER]: false,
    [SECTION_TASKS.ECOLOGIST]: false,
    [SECTION_TASKS.WORK_ACTIVITY]: false,
    [SECTION_TASKS.PERMISSIONS]: false,
    [SECTION_TASKS.SITES]: false,
    [SECTION_TASKS.SETTS]: false,
    [SECTION_TASKS.WORK_SCHEDULE]: true,
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
            uri: APPLICANT_USER.uri,
            status: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
              ? STATUS_VALUES.NOT_STARTED
              : STATUS_VALUES.CANNOT_START_YET,
            enabled: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
          },
          {
            name: SECTION_TASKS.ECOLOGIST,
            uri: ECOLOGIST_USER.uri,
            status: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
              ? STATUS_VALUES.NOT_STARTED
              : STATUS_VALUES.CANNOT_START_YET,
            enabled: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
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
            uri: '/',
            status: () => STATUS_VALUES.CANNOT_START_YET
          },
          {
            name: SECTION_TASKS.SETTS,
            uri: '/',
            status: () => STATUS_VALUES.CANNOT_START_YET
          },
          {
            name: SECTION_TASKS.WORK_SCHEDULE,
            uri: FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.uri,
            status: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
              ? STATUS_VALUES.NOT_STARTED
              : STATUS_VALUES.CANNOT_START_YET,
            enabled: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
          }
        ]
      },
      {
        name: 'apply',
        tasks: [
          {
            name: SECTION_TASKS.SUBMIT,
            uri: DECLARATION.uri,
            status: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
              ? STATUS_VALUES.NOT_STARTED
              : STATUS_VALUES.CANNOT_START_YET,
            enabled: status => status[SECTION_TASKS.ELIGIBILITY_CHECK]
          }
        ]
      }
    ]
  }
}
