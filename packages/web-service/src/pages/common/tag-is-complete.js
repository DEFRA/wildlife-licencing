import { tagStatus } from '../../services/api-requests.js'

export const isComplete = tagState => {
  return tagState === tagStatus.COMPLETE
}
