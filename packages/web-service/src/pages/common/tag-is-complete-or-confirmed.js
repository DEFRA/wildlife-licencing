import { tagStatus } from '../../services/api-requests.js'

export const isCompleteOrConfirmed = tagState => (tagState === tagStatus.COMPLETE) || (tagState === tagStatus.COMPLETE_NOT_CONFIRMED)
