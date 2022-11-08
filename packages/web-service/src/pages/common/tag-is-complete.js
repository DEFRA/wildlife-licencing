import { tagStatus } from '../../services/api-requests.js'

export const isComplete = tagState => tagState === tagStatus.COMPLETE
