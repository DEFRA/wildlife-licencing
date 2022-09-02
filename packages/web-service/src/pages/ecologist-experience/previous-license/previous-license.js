import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
const yesNo = 'yes-no'

const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  console.log(journeyData)
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_LICENSE_DETAILS.uri
  }
  if (journeyData.ecologistExperience.complete) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
}

const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const previousLicense = pageData.payload[yesNo] === 'yes'
  if (!journeyData.ecologistExperience) {
    journeyData.ecologistExperience = {}
  }
  Object.assign(journeyData.ecologistExperience, { previousLicense })
  if (previousLicense === false) {
    delete journeyData.ecologistExperience.licenseDetails
  }
  await request.cache().setData(journeyData)
}

export default yesNoPage({ page: ecologistExperienceURIs.PREVIOUS_LICENSE.page, uri: ecologistExperienceURIs.PREVIOUS_LICENSE.uri, completion, setData })
