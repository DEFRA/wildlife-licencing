import { APIRequests } from '../services/api-requests.js'

export const changeHandler = async (journeyData, id) => {
  const habitats = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId, id)
  const chosenHabitat = habitats.filter(habitat => habitat.id === id)[0]
  Object.assign(journeyData, { habitatData: chosenHabitat })
  return journeyData
}

export const putData = async journeyData => {
  const settId = journeyData.habitatData.id
  const applicationId = journeyData.applicationId
  await APIRequests.HABITAT.putHabitatById(applicationId, settId, journeyData.habitatData)
}
