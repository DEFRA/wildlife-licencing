import { APIRequests } from '../../services/api-requests.js'

export const restoreInputGetData = async (request, key) => {
  const journeyData = await request.cache().getData()

  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(journeyData.applicationId)
  if (key === 'enter-experience') {
    return ecologistExperience.experienceDetails
  } else {
    return ecologistExperience.methodExperience
  }
}
