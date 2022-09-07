import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
const yesNo = 'yes-no'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
  }
  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const classMitigation = pageData.payload[yesNo] === 'yes'
  Object.assign(journeyData.ecologistExperience, { classMitigation })
  if (classMitigation === false) {
    delete journeyData.ecologistExperience.classMitigationDetails
    if (!journeyData.ecologistExperience.complete) {
      Object.assign(journeyData.ecologistExperience, { complete: true })
      APIRequests.ECOLOGIST_EXPERIENCE.create(journeyData.applicationId, journeyData.ecologistExperience)
    } else {
      APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
    }
  }
  await request.cache().setData(journeyData)
}

export default yesNoPage({ page: ecologistExperienceURIs.CLASS_MITIGATION.page, uri: ecologistExperienceURIs.CLASS_MITIGATION.uri, completion, setData })
