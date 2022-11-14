import { APIRequests, tagStatus } from '../../services/api-requests.js'

export const isComplete = tagState => tagState === tagStatus.COMPLETE
export const isCompleteOrConfirmed = tagState => (tagState === tagStatus.COMPLETE) || (tagState === tagStatus.COMPLETE_NOT_CONFIRMED) // All of these pages need to do the exact same thing when the journey starts
// This allows us to abstract it away into a function to re-use
// The other states being set (NOT_STARTED, COMPLETE etc.) become more customised, so have been kept inline
export const moveTagInProgress = async (applicationId, tagKey) => {
  const state = await APIRequests.APPLICATION.tags(applicationId).get(tagKey)
  if (state === tagStatus.NOT_STARTED) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: tagKey, tagState: tagStatus.IN_PROGRESS })
  }
}
