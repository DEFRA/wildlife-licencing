import pageRoute from '../../../routes/page-route.js'
import { APPLICATIONS, ecologistExperienceURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

const prt = a => {
  if (a === undefined) {
    return '-'
  } else {
    return a ? 'yes' : 'no'
  }
}

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
  const result = [{ key: 'previousLicence', value: prt(ecologistExperience.previousLicence) }]
  if (ecologistExperience.previousLicence) {
    result.push({ key: 'licenceDetails', value: ecologistExperience.licenceDetails.join(', ') })
  }
  const experienceDetails = `${ecologistExperience.experienceDetails.substring(0, 100)}${ecologistExperience.experienceDetails.length > 100 ? '...' : ''}`
  const methodExperience = `${ecologistExperience.methodExperience.substring(0, 100)}${ecologistExperience.methodExperience.length > 100 ? '...' : ''}`
  result.push({ key: 'experienceDetails', value: experienceDetails })
  result.push({ key: 'methodExperience', value: methodExperience })
  result.push({ key: 'classMitigation', value: prt(ecologistExperience.classMitigation) })
  if (ecologistExperience.classMitigation) {
    result.push({ key: 'classMitigationDetails', value: ecologistExperience.classMitigationDetails })
  }

  return result
}

export const completion = async () => TASKLIST.uri

export default pageRoute({
  page: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.page,
  uri: ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri,
  checkData,
  getData,
  completion: TASKLIST.uri
})
