import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'
import { tagStatus } from '../../../services/status-tags.js'
import { boolFromYesNo } from '../../common/common.js'
const yesNo = 'yes-no'

export const completion = async request => {
  if (request.payload[yesNo] === 'yes') {
    return ecologistExperienceURIs.ENTER_LICENCE_DETAILS.uri
  }

  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)

  if (!ecologistExperience.experienceDetails) {
    return ecologistExperienceURIs.ENTER_EXPERIENCE.uri
  }

  if (!ecologistExperience.methodExperience) {
    return ecologistExperienceURIs.ENTER_METHODS.uri
  }

  if (ecologistExperience.classMitigation === undefined) {
    return ecologistExperienceURIs.CLASS_MITIGATION.uri
  }

  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
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

  const answer = request.payload[yesNo]
  const tagState = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (isCompleteOrConfirmed(tagState) && boolFromYesNo(answer) !== ecologistExperience.previousLicence) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.IN_PROGRESS })
  }

  ecologistExperience.previousLicence = answer === 'yes'
  if (!ecologistExperience.previousLicence) {
    await APIRequests.ECOLOGIST_EXPERIENCE.removePreviousLicences(applicationId)
  }

  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default yesNoPage({
  page: ecologistExperienceURIs.PREVIOUS_LICENCE.page,
  uri: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
  checkData: checkApplication,
  completion,
  getData,
  setData
})
