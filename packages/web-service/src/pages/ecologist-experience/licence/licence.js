import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { boolFromYesNo } from '../../common/common.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  const previousLicences = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(applicationId)
  return { previousLicences, allRemoved: !!ecologistExperience?.previousLicencesAllRemoved }
}

export const completion = async request => {
  if (boolFromYesNo(request.payload.licence)) {
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

export default pageRoute({
  uri: ecologistExperienceURIs.LICENCE.uri,
  page: ecologistExperienceURIs.LICENCE.page,
  checkData: checkApplication,
  validator: Joi.object({
    licence: Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData
})
