import pageRoute from '../../routes/page-route.js'
import { OTHER_SPECIES, SPECIES, NSIP } from '../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import Joi from 'joi'
import { ApplicationService } from '../../services/application.js'
import { APIRequests } from '../../services/api-requests.js'

// Retain the keys object but filter to only those currently implemented.
const filterKeys = speciesSubjects => Object.entries(PowerPlatformKeys.SPECIES_SUBJECT)
  .filter(([_k, v]) => speciesSubjects.includes(v))
  .reduce((a, [c, v]) => ({ ...a, [c]: v }), {})

/**
 * Returns th species subjects to drive the page selections
 * @returns {Promise<{speciesSubject: *}>}
 */
export const getSpeciesData = async () => ({ speciesSubject: filterKeys([PowerPlatformKeys.SPECIES_SUBJECT.BADGER]) })

// Temporary map to set up the A24 activities, purposes and species (subject)
// This will gradually be replaced by a uuser journey to derive these properties
// and select the licence
const LICENCE_TYPES = {
  [PowerPlatformKeys.SPECIES_SUBJECT.BADGER]: {
    purpose: PowerPlatformKeys.APPLICATION_PURPOSES.DEVELOPMENT,
    activities: [PowerPlatformKeys.ACTIVITY_ID.INTERFERE_WITH_BADGER_SETT]
  }
}

export const setSpeciesData = async request => {
  if (request.payload.species !== 'other') {
  // Look up the application type
    const filter = {
      speciesSubjects: [request.payload.species],
      purposes: [LICENCE_TYPES[request.payload.species].purpose],
      activities: LICENCE_TYPES[request.payload.species].activities
    }

    const { types: [typeId], purposes: [purposeId] } = await APIRequests.APPLICATION_TYPES.select(filter)
    await ApplicationService.createApplication(request, typeId, purposeId)
  }
}

export const speciesCompletion = async request => {
  if (request.payload.species === 'other') {
    return OTHER_SPECIES.uri
  }
  return NSIP.uri
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
