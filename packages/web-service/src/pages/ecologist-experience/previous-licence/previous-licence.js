import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'
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

  return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
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
  await moveTagInProgress(applicationId, SECTION_TASKS.ECOLOGIST_EXPERIENCE)

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
  checkData: [checkApplication, checkData],
  completion,
  getData,
  setData
})
