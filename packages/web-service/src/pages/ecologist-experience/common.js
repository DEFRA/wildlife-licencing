import { APIRequests } from '../../services/api-requests.js'
import { tagStatus } from '../../services/status-tags.js'
import { ecologistExperienceURIs } from '../../uris.js'
import { boolFromYesNo } from '../common/common.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'

export const licenceCompletion = async (request, licenceYesNo) => {
  if (boolFromYesNo(licenceYesNo)) {
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
