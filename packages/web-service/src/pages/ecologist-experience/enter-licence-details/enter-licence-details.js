import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ecologistExperienceURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { cacheDirect } from '../../../session-cache/cache-decorator.js'

const licenceDetailsInput = 'enter-licence-details'

export const validator = async (payload, context) => {
  const { applicationId } = await cacheDirect(context).getData()
  const previousLicences = await APIRequests.ECOLOGIST_EXPERIENCE.getPreviousLicences(applicationId)
  const found = previousLicences.find(previousLicence => previousLicence.trim() === payload[licenceDetailsInput].trim())
  if (!payload[licenceDetailsInput]?.trim()) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: You have not entered a licence number',
      path: [licenceDetailsInput],
      type: 'emptyLicenceDetails',
      context: {
        label: licenceDetailsInput,
        value: 'Error',
        key: licenceDetailsInput
      }
    }], null)
  }
  if (found) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: You have already entered this badger mitigation licence',
      path: [licenceDetailsInput],
      type: 'existingLicenceDetails',
      context: {
        label: licenceDetailsInput,
        value: 'Error',
        key: licenceDetailsInput
      }
    }], null)
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.ECOLOGIST_EXPERIENCE.addPreviousLicence(applicationId, request.payload[licenceDetailsInput])
  const ecologistExperience = await APIRequests.ECOLOGIST_EXPERIENCE.getExperienceById(applicationId)
  delete ecologistExperience.previousLicencesAllRemoved
  await APIRequests.ECOLOGIST_EXPERIENCE.putExperienceById(applicationId, ecologistExperience)
}

export default pageRoute({
  uri: ecologistExperienceURIs.ENTER_LICENCE_DETAILS.uri,
  page: ecologistExperienceURIs.ENTER_LICENCE_DETAILS.page,
  checkData: checkApplication,
  completion: ecologistExperienceURIs.LICENCE.uri,
  validator,
  setData
})
