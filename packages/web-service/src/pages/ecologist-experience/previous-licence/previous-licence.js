import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { boolFromYesNo } from '../../common/common.js'
import { tagStatus } from '../../../services/status-tags.js'

export const completion = async request => {
  if (boolFromYesNo(request.payload['yes-no'])) {
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

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData() || {}

  const previousLicences = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(journeyData.applicationId)
  if (previousLicences.length !== 0) {
    return h.redirect(ecologistExperienceURIs.LICENCE.uri)
  }
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

  // If the user is going from 'No' to 'Yes', then there are more queestions they need to answer (they won't have answered)
  // And they can't go back to CYA
  if (boolFromYesNo(request.payload['yes-no']) && ecologistExperience?.previousLicence === false) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.IN_PROGRESS })
  }

  ecologistExperience.previousLicence = boolFromYesNo(request.payload['yes-no'])
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
