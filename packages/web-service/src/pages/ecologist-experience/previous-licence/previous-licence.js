import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { APPLICATIONS, ecologistExperienceURIs } from '../../../uris.js'
import { isCompleteOrConfirmed } from '../../common/tag-is-complete-or-confirmed.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
const yesNo = 'yes-no'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (pageData.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_LICENCE_DETAILS.uri
  }
  if (isCompleteOrConfirmed(tagState)) {
    return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
  }
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.IN_PROGRESS })
  return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  if (request.query?.change !== 'true') {
    const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
    if (isCompleteOrConfirmed(tagState)) {
      return h.redirect(ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri)
    }
  }

  return undefined
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  if (Object.keys(ecologistExperience).length === 0) {
    return null
  }
  return { yesNo: ecologistExperience.previousLicence ? 'yes' : 'no' }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  ecologistExperience.previousLicence = request.payload[yesNo] === 'yes'
  if (!ecologistExperience.previousLicence) {
    await APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicences(applicationId)
  }
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default yesNoPage({
  page: ecologistExperienceURIs.PREVIOUS_LICENCE.page,
  uri: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
  completion,
  getData,
  setData,
  checkData
})
