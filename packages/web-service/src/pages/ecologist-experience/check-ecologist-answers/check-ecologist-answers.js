import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { yesNoFromBool } from '../../common/common.js'
import { Backlink } from '../../../handlers/backlink.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const previousLicences = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(applicationId)
  const result = [{ key: 'previousLicence', value: yesNoFromBool(ecologistExperience.previousLicence) }]
  if (ecologistExperience.previousLicence) {
    result.push({ key: 'licenceDetails', value: previousLicences.join(', ') })
  }
  result.push({ key: 'experienceDetails', value: ecologistExperience.experienceDetails })
  result.push({ key: 'methodExperience', value: ecologistExperience.methodExperience })
  result.push({ key: 'classMitigation', value: yesNoFromBool(ecologistExperience.classMitigation) })
  if (ecologistExperience.classMitigation) {
    result.push({ key: 'classMitigationDetails', value: ecologistExperience.classMitigationDetails })
  }

  return result
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.ECOLOGIST_EXPERIENCE)

  if (!isCompleteOrConfirmed(tagState)) {
    return h.redirect(ecologistExperienceURIs.PREVIOUS_LICENCE.uri)
  }

  return null
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export default pageRoute({
  page: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.page,
  uri: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri,
  checkData: [checkApplication, checkData],
  backlink: Backlink.NO_BACKLINK,
  getData,
  completion
})
