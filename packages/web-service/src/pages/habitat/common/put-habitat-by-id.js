import { APIRequests } from '../../../services/api-requests.js'

export const putHabitatById = async journeyData => {
  const settId = journeyData.habitatData.id
  const applicationId = journeyData.applicationId
  await APIRequests.HABITAT.putHabitatById(applicationId, settId, journeyData.habitatData)
}
