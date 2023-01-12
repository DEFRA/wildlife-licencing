import { APIRequests } from '../../services/api-requests.js'
import { tagStatus } from '../../services/status-tags.js'

// TODO
export const isAppSubmittable = async applicationId => true

export const getTaskStatus = (task, tags = []) => tags.find(t => t.tag === task)?.tagState
export const hasTaskStatusOf = (task, tags = [], status) => getTaskStatus(task, tags) === status
export const hasTaskStatusIn = (task, tags = [], ...statuses) => statuses.find(s => hasTaskStatusOf(task, tags, s))
export const hasTaskCompleted = (task, tags) => hasTaskStatusOf(task, tags, tagStatus.COMPLETE)
export const hasTaskCompletedOrCompletedNotConfirmed = (task, tags) => hasTaskStatusIn(task, tags, tagStatus.COMPLETE, tagStatus.COMPLETE_NOT_CONFIRMED)
export const haveTasksCompleted = (tasks, tags) => tasks.every(t => hasTaskCompleted(t, tags))
export const countTasksCompleted = (tasks, tags) => tasks.filter(t => hasTaskCompleted(t, tags)).length

export const LicenceTypes = {}

export class LicenceType {
  /**
   * Class to represent the tasklist structure of a licence type
   * @param name - The name of the licence type, mapping to the titleText object in tasklist-text.njk
   * @param sectionTasks - an array of the structure [{ section: {name}, tasks: [{name, uri, status, enabled}]}, ...]
   * @param canShowReference - function of tags to indicate if application number may be shown
   * @param getProgressFunc - function of tags to return progress conforming to "progress": {
   *     "complete": Integer,
   *     "from": Integer
   *   }
   * @param canSubmitFunc - function of tags returning boolean indicating if submission allowed
   */
  constructor ({ name, sectionTasks, canShowReferenceFunc, getProgressFunc, canSubmitFunc }) {
    this.name = name
    this.sectionTasks = sectionTasks
    this.canShowReferenceFunc = canShowReferenceFunc
    this.getProgressFunc = getProgressFunc
    this.canSubmitFunc = canSubmitFunc
  }

  async getTags (request) {
    const journeyData = await request.cache().getData()
    return APIRequests.APPLICATION.tags(journeyData.applicationId).getAll()
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
    const tags = await this.getTags(request)
    return this.sectionTasks.map(st => ({
      name: st.section.name,
      tasks: st.tasks.map(t => this.makeTask(t, tags))
    }))
  }

  async canShowReference (request) {
    const tags = await this.getTags(request)
    return this.canShowReferenceFunc(tags)
  }

  async getProgress (request) {
    const tags = await this.getTags(request)
    return this.getProgressFunc(tags)
  }

  async canSubmit (request) {
    const tags = await this.getTags(request)
    return this.canSubmitFunc(tags)
  }
}
