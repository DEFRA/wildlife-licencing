import { APIRequests } from '../../services/api-requests.js'

export const restoreInputGetData = async (request, key) => {
  const journeyData = await request.cache().getData()

  if (journeyData.tempInput) {
    const inputText = journeyData.tempInput
    delete journeyData.tempInput
    await request.cache().setData(journeyData)
    return inputText
  }

  // If there's no tempInput from the validator, retrieve the data from the API (might be an empty string)
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(journeyData.applicationId)
  if (key === 'enter-experience') {
    return ecologistExperience.experienceDetails
  } else {
    return ecologistExperience.methodExperience
  }
}
