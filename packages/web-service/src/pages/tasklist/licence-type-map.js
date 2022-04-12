import { eligibilityURIs } from '../../uris.js'
const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs

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
  SEND_APPLICATION: 'send-application'
}

// The expected status values for tasks
export const STATUS_VALUES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in-progress',
  NOT_STARTED: 'not-started',
  CANNOT_START_YET: 'cannot-start'
}

// Used throughout the service to update the status of a given task
export const updateStatusCache = async (request, task, status) => {
  const journeyData = await request.cache().getData() || {}
  journeyData.tasks = journeyData.tasks || {}
  const { tasks } = journeyData
  tasks[task] = status
  await request.cache().setData(journeyData)
}

// Returns a function of the request to get the current status of a task
export const getStatus = task => async request => {
  const journeyData = await request.cache().getData()
  return journeyData?.tasks?.[task] || STATUS_VALUES.CANNOT_START_YET
}

// Return a progress object containing the number of completed tasks of total tasks )
export const getProgress = decoratedMap => ({
  completed: decoratedMap.flatMap(s => s.tasks).filter(t => t.status === STATUS_VALUES.COMPLETED).length,
  from: decoratedMap.flatMap(s => s.tasks).length
})

// A function to take the static map for a given licence type and decorate it using the current cache state
export const decorateMap = (request, currentLicenceTypeMap) => Promise.all(currentLicenceTypeMap.sections.map(async s => ({
  ...s,
  tasks: await Promise.all(s.tasks.map(async t => ({
    ...t,
    ...(typeof t.uri === 'function' && {
      uri: await t.uri(request)
    }),
    status: await t.status(request)
  })))
}))
)

// A map of the sections and tasks by licence type
export const licenceTypeMap = {
  [A24]: {
    sections: [
      {
        name: 'check-before-you-start', // The name of a section, referred on in the template
        tasks: [ // The set of tasks in this section
          {
            name: SECTION_TASKS.ELIGIBILITY_CHECK, // The name of the task within a section, referred to in the template
            uri: async request => await (getStatus(SECTION_TASKS.ELIGIBILITY_CHECK)(request)) === STATUS_VALUES.COMPLETED
              ? ELIGIBILITY_CHECK.uri
              : LANDOWNER.uri, // Either a fixed uri or a function of the request to resolve the uri
            status: getStatus(SECTION_TASKS.ELIGIBILITY_CHECK) // returns a function of request to get the current status
          }
        ]
      },
      {
        name: 'contact-details',
        tasks: [
          {
            name: SECTION_TASKS.LICENCE_HOLDER,
            uri: '/',
            status: getStatus(SECTION_TASKS.LICENCE_HOLDER)
          },
          {
            name: SECTION_TASKS.ECOLOGIST,
            uri: '/',
            status: getStatus(SECTION_TASKS.ECOLOGIST)
          }
        ]
      },
      {
        name: 'planned-work-activity',
        tasks: [
          {
            name: SECTION_TASKS.WORK_ACTIVITY,
            uri: '/',
            status: getStatus(SECTION_TASKS.WORK_ACTIVITY)
          },
          {
            name: SECTION_TASKS.PERMISSIONS,
            uri: '/',
            status: getStatus(SECTION_TASKS.PERMISSIONS)
          },
          {
            name: SECTION_TASKS.SITES,
            uri: '/',
            status: getStatus(SECTION_TASKS.SITES)
          },
          {
            name: SECTION_TASKS.SETTS,
            uri: '/',
            status: getStatus(SECTION_TASKS.SETTS)
          }
        ]
      },
      {
        name: 'apply',
        tasks: [
          {
            name: SECTION_TASKS.SEND_APPLICATION,
            uri: '/',
            status: getStatus(SECTION_TASKS.SEND_APPLICATION)
          }
        ]
      }
    ]
  }
}
