import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { checkApplication } from '../../common/check-application.js'
const yesNo = 'yes-no'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
  }
  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  return { yesNo: ecologistExperience.classMitigation ? 'yes' : 'no' }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const classMitigation = request.payload[yesNo] === 'yes'
  Object.assign(ecologistExperience, { classMitigation })
  if (!classMitigation) {
    delete ecologistExperience.classMitigationDetails
    await APIRequests.APPLICATION.tags(applicationId).add(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  }
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default yesNoPage({
  checkData: checkApplication,
  page: ecologistExperienceURIs.CLASS_MITIGATION.page,
  uri: ecologistExperienceURIs.CLASS_MITIGATION.uri,
  completion,
  setData
})
