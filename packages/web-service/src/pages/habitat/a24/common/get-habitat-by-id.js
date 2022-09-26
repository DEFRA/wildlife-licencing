import { APIRequests } from '../../../../services/api-requests.js'

export const getHabitatById = async (journeyData, id) => {
  const habitats = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId, id)
  const chosenHabitat = habitats.filter(habitat => habitat.id === id)[0]
  Object.assign(journeyData, { habitatData: chosenHabitat })
  return journeyData
}
