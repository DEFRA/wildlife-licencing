import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
const yesNo = 'yes-no'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_LICENSE_DETAILS.uri
  }
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const existingExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(journeyData.applicationId)
  if (existingExperience && !journeyData.ecologistExperience?.complete) {
    return h.redirect(ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri)
  }
  return undefined
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const previousLicense = pageData.payload[yesNo] === 'yes'
  if (!journeyData.ecologistExperience) {
    journeyData.ecologistExperience = {}
  }
  Object.assign(journeyData.ecologistExperience, { previousLicense })
  if (previousLicense === false) {
    delete journeyData.ecologistExperience.licenseDetails
    if (journeyData.ecologistExperience.complete) { // The put is only done when the previousLicense is false, because otherwise the details need to be added before it is sent.
      APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(journeyData.applicationId, journeyData.ecologistExperience)
    }
  }
  await request.cache().setData(journeyData)
}

export default yesNoPage({ page: ecologistExperienceURIs.PREVIOUS_LICENSE.page, uri: ecologistExperienceURIs.PREVIOUS_LICENSE.uri, completion, setData, checkData })
