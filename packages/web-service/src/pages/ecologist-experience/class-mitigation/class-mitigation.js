import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'

export const completion = async request =>
  boolFromYesNo(request.payload['yes-no'])
    ? ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
    : ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  if (Object.keys(ecologistExperience).length === 0) {
    return null
  }
  return { yesNo: yesNoFromBool(ecologistExperience.classMitigation) }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const hasAClassMitigationLicence = boolFromYesNo(request.payload['yes-no'])

  // If the user answers 'Yes' on this page
  if (hasAClassMitigationLicence) {
    // Just need to ensure here, the user hasn't clicked 'Yes' on the primary AND return journey
    // In that case, we should them back to CYA (and not reset the status to IN_PROGRESS)
    if (ecologistExperience.classMitigation === false) {
      await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.IN_PROGRESS })
    }
  } else if (!hasAClassMitigationLicence) {
    if (ecologistExperience.classMitigation) {
      // If the user goes from 'Yes' to 'No' - we need to delete the classMitigationDetails
      delete ecologistExperience.classMitigationDetails
    }

    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  }

  Object.assign(ecologistExperience, { classMitigation: hasAClassMitigationLicence })
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default yesNoPage({
  checkData: checkApplication,
  page: ecologistExperienceURIs.CLASS_MITIGATION.page,
  uri: ecologistExperienceURIs.CLASS_MITIGATION.uri,
  getData,
  completion,
  setData
})
