import { tagStatus } from '../../services/api-requests.js'

export const isComplete = state => {
  return state === tagStatus.complete
}
