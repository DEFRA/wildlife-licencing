import { APIRequests } from '../../services/api-requests.js'
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

export const getTaskStatus = (task, tags = []) => tags.find(t => t.tag === task)?.tagState
export const hasTaskStatusOf = (task, tags = [], status) => getTaskStatus(task, tags) === status
export const hasTaskStatusIn = (task, tags = [], ...statuses) => statuses.find(s => hasTaskStatusOf(task, tags, s))
export const hasTaskCompleted = (task, tags) => hasTaskStatusOf(task, tags, tagStatus.COMPLETE)
export const hasTaskCompletedOrCompletedNotConfirmed = (task, tags) => hasTaskStatusIn(task, tags, tagStatus.COMPLETE, tagStatus.COMPLETE_NOT_CONFIRMED)
export const haveTasksCompleted = (tasks, tags) => tasks.every(t => hasTaskCompleted(t, tags))

export class LicenceType {
  constructor (name, sectionTasks) {
    this.name = name
    this.sectionTasks = sectionTasks
  }

  makeTask (task, tags) {
    return {
      name: task.name,
      uri: task.uri(tags),
      status: task.status(tags),
      enabled: task.enabled(tags)
    }
  }

  async decorate (request) {
    const journeyData = await request.cache().getData()
    const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)
    return this.sectionTasks.map(st => ({
      name: st.section.name,
      tasks: st.tasks.map(t => this.makeTask(t, application.applicationTags))
    }))
  }
}
