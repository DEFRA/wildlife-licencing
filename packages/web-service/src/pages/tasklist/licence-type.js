import { tagStatus } from '../../services/status-tags.js'

// export const A13 = 'A13 Bat mitigation licence'
// export const A14 = 'A13 Great crested newt mitigation licence'
// export const A24 = 'A24 Badger mitigation licence'

// Determine if an application is submittable
// export const isAppSubmittable = async applicationId => {
//   // Temporary taking out WORK_ACTIVITY and PERMISSIONS from the length of the section tasks
//   const totalSections = Object.keys(SECTION_TASKS).length - 3
//   const totalCompletedSections = await countCompleteSections(applicationId)
//
//   return totalCompletedSections.length < totalSections
// }

export const isAppSubmittable = async applicationId => true

// Return a progress object containing the number of completed tasks of total tasks )
export const getProgress = status => ({
  complete: Object.values(status).filter(s => s).length,
  from: Object.keys(status).length
})

export const getTaskStatus = async (request, task) => tagStatus.NOT_STARTED
export const hasTaskStatus = async (request, task, ...statuses) => false
export const isTaskStatus = async (request, task, status) => false

// export const getTaskStatus = async request => {
//   const journeyData = await request.cache().getData()
//   const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)
//   const applicationTags = application.applicationTags || []
//   return {
//     [SECTION_TASKS.ELIGIBILITY_CHECK]: (applicationTags.find(t => t.tag === SECTION_TASKS.ELIGIBILITY_CHECK) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.LICENCE_HOLDER]: (applicationTags.find(t => t.tag === SECTION_TASKS.LICENCE_HOLDER) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.ECOLOGIST]: (applicationTags.find(t => t.tag === SECTION_TASKS.ECOLOGIST) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.AUTHORISED_PEOPLE]: (applicationTags.find(t => t.tag === SECTION_TASKS.AUTHORISED_PEOPLE) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.ADDITIONAL_CONTACTS]: (applicationTags.find(t => t.tag === SECTION_TASKS.ADDITIONAL_CONTACTS) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.INVOICE_PAYER]: (applicationTags.find(t => t.tag === SECTION_TASKS.INVOICE_PAYER) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.ECOLOGIST_EXPERIENCE]: (applicationTags.find(t => t.tag === SECTION_TASKS.ECOLOGIST_EXPERIENCE) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.WORK_ACTIVITY]: { tagState: tagStatus.NOT_STARTED },
//     [SECTION_TASKS.PERMISSIONS]: { tagState: tagStatus.NOT_STARTED },
//     [SECTION_TASKS.SITES]: (applicationTags.find(t => t.tag === SECTION_TASKS.SITES) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.SETTS]: (applicationTags.find(t => t.tag === SECTION_TASKS.SETTS) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.SUPPORTING_INFORMATION]: (applicationTags.find(t => t.tag === SECTION_TASKS.SUPPORTING_INFORMATION) || { tagState: tagStatus.NOT_STARTED }),
//     [SECTION_TASKS.SUBMIT]: { tagState: tagStatus.NOT_STARTED }
//   }
// }

// export const decorateMap = (request, map) => {
//   Object.entries(map.sections).forEach(([k, v]) => {
//     console.log(k, v)
//   })
// }

// A function to take the static map for a given licence type and decorate it using the current cache state
// export const decorateMap = (currentLicenceTypeMap, taskStatus) => currentLicenceTypeMap.sections.map(s => ({
//   ...s,
//   tasks: s.tasks.map(t => ({
//     ...t,
//     ...(typeof t.uri === 'function' && {
//       uri: t.uri(taskStatus)
//     }),
//     ...(typeof t.status === 'function' && {
//       status: t.status(taskStatus)
//     }),
//     ...(typeof t.enabled === 'function' && {
//       enabled: t.enabled(taskStatus)
//     })
//   }))
// }))

// export const getState = (status, sectionTaskKey) => {
//   if (!eligibilityCompleted(status)) {
//     return tagStatus.CANNOT_START
//   }
//   return status[sectionTaskKey].tagState
// }

// This essentially does the same job as the `getState` function
// But it also checks other features are complete too
// E.g. 'Add invoice details' depends upon 3 other flows being complete
export const getStateDependsUpon = (status, sectionTaskKey, dependUpon) => {
  /* if (!eligibilityCompleted(status)) {
    return tagStatus.CANNOT_START
  }

  for (let i = 0; i < dependUpon.length; i++) {
    const key = dependUpon[i]
    if (!isComplete(status[key].tagState)) {
      return tagStatus.CANNOT_START
    }
  }

  return status[sectionTaskKey].tagState */
}

// A map of the sections and tasks by licence type
export class LicenceType {
  constructor (name, sectionTasks) {
    this.name = name
    this.sectionTasks = sectionTasks
  }

  async makeTask (request, task) {
    return {
      name: task.name,
      uri: await task.uri(request),
      status: await task.status(request),
      enabled: await task.enabled(request)
    }
  }

  async decorate (request) {
    return Promise.all(this.sectionTasks.map(async st => ({
      name: st.section.name,
      tasks: await Promise.all(st.tasks.map(async t => this.makeTask(request, t)))
    })))
  }
}
