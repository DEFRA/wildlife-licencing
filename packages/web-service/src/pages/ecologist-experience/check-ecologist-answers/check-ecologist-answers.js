import pageRoute from '../../../routes/page-route.js'
import { APPLICATIONS, ecologistExperienceURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { yesNoFromBool } from '../../common/common.js'
import { Backlink } from '../../../handlers/backlink.js'

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  const flagged = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.ECOLOGIST_EXPERIENCE)
  if (!flagged) {
    return h.redirect(ecologistExperienceURIs.PREVIOUS_LICENCE.uri)
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const previousLicences = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(applicationId)
  const result = [{ key: 'previousLicence', value: yesNoFromBool(ecologistExperience.previousLicence) }]
  if (ecologistExperience.previousLicence) {
    result.push({ key: 'licenceDetails', value: previousLicences.join(', ') })
  }
  const experienceDetails = `${ecologistExperience.experienceDetails.substring(0, 100)}${ecologistExperience.experienceDetails.length > 100 ? '...' : ''}`
  const methodExperience = `${ecologistExperience.methodExperience.substring(0, 100)}${ecologistExperience.methodExperience.length > 100 ? '...' : ''}`
  result.push({ key: 'experienceDetails', value: experienceDetails })
  result.push({ key: 'methodExperience', value: methodExperience })
  result.push({ key: 'classMitigation', value: yesNoFromBool(ecologistExperience.classMitigation) })
  if (ecologistExperience.classMitigation) {
    result.push({ key: 'classMitigationDetails', value: ecologistExperience.classMitigationDetails })
  }

  return result
}

export const completion = async () => TASKLIST.uri

export default pageRoute({
  page: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.page,
  uri: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri,
  checkData: checkData,
  getData: getData,
  completion: TASKLIST.uri,
  backlink: Backlink.NO_BACKLINK
})
