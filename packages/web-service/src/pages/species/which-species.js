import pageRoute from '../../routes/page-route.js'
import { OTHER_SPECIES, SPECIES, eligibilityURIs } from '../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import Joi from 'joi'
import { ApplicationService } from '../../services/application.js'

const getSpeciesData = async () => ({ speciesSubject: PowerPlatformKeys.SPECIES_SUBJECT })
const setSpeciesData = async request => {
  if (request.payload.species !== 'other') {
    await ApplicationService.createApplication(request)
  }
}

const speciesCompletion = async request => {
  if (request.payload.species === 'other') {
    return OTHER_SPECIES.uri
  }
  return eligibilityURIs.LANDOWNER.uri
}

const validator = Joi.object({
  species: Joi.any().valid('other', ...Object.values(PowerPlatformKeys.SPECIES_SUBJECT)).required()
}).options({ abortEarly: false, allowUnknown: true })

export default pageRoute({
  page: SPECIES.page,
  uri: SPECIES.uri,
  getData: getSpeciesData,
  validator: validator,
  setData: setSpeciesData,
  completion: speciesCompletion,
  options: { auth: { mode: 'optional' } }
})
