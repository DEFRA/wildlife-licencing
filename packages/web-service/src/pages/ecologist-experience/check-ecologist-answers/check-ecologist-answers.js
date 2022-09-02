import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs, TASKLIST } from '../../../uris.js'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  journeyData.ecologistExperience.previousLicenseDisplay = journeyData.ecologistExperience.previousLicense ? 'Yes' : 'No'
  journeyData.ecologistExperience.classMitigationDisplay = journeyData.ecologistExperience.classMitigation ? 'Yes' : 'No'
  return journeyData.ecologistExperience
}

export const completion = async request => TASKLIST.uri

export default pageRoute({ page: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.page, uri: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri, getData, completion })
