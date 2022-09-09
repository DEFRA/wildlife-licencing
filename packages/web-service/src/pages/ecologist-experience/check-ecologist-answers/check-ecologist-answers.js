import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

export const checkData = async request => {
  const journeyData = await request.cache().getData()
  if (!journeyData.ecologistExperience) {
    const existingExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(journeyData.applicationId)
    Object.assign(journeyData, { ecologistExperience: { ...existingExperience, complete: true } })
    await request.cache().setData(journeyData)
  }
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  journeyData.ecologistExperience.previousLicenseDisplay = journeyData.ecologistExperience.previousLicense ? 'Yes' : 'No'
  journeyData.ecologistExperience.classMitigationDisplay = journeyData.ecologistExperience.classMitigation ? 'Yes' : 'No'
  return journeyData.ecologistExperience
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData.ecologistExperience
  await request.cache().setData(journeyData)
}

export const completion = async () => TASKLIST.uri

export default pageRoute({ page: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.page, uri: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri, getData, completion, checkData, setData })
