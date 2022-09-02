import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
const yesNo = 'yes-no'

const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
  }
  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
}

const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const classMitigation = pageData.payload[yesNo] === 'yes'
  Object.assign(journeyData.ecologistExperience, { classMitigation })
  if (classMitigation === false) {
    Object.assign(journeyData.ecologistExperience, { complete: true })
    delete journeyData.ecologistExperience.classMitigationDetails
  }
  console.log(journeyData.ecologistExperience)
  await request.cache().setData(journeyData)
}

export default yesNoPage({ page: ecologistExperienceURIs.CLASS_MITIGATION.page, uri: ecologistExperienceURIs.CLASS_MITIGATION.uri, completion, setData })
