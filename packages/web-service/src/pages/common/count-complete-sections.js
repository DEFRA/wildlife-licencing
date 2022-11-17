import { APIRequests, tagStatus } from '../../services/api-requests.js'

// We can determine from the applicationTags on application
// How close to completing the application, the user is
export const countCompleteSections = async applicationId => {
  const allTags = await APIRequests.APPLICATION.tags(applicationId).getAll()
  return allTags.filter(tag => tag.tagState === tagStatus.COMPLETE)
}
