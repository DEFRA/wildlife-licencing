import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'
const yesNo = 'yes-no'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
  }
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  if (Object.keys(ecologistExperience).length === 0) {
    return null
  }
  return { yesNo: ecologistExperience.classMitigation ? 'yes' : 'no' }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const classMitigation = request.payload[yesNo] === 'yes'
  Object.assign(ecologistExperience, { classMitigation })
  if (!classMitigation) {
    delete ecologistExperience.classMitigationDetails
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
