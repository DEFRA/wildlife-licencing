import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../services/api-requests.js'
import { v4 as uuidv4 } from 'uuid'

const {
  METHOD_IDS: { DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, OBSTRUCT_SETT_WITH_GATES },
  SPECIES: { BADGER },
  ACTIVITY_ID: { INTERFERE_WITH_BADGER_SETT }
} = PowerPlatformKeys

export const completion = async _request => habitatURIs.CHECK_YOUR_ANSWERS.uri

export const getData = async _request => {
  return {
    OBSTRUCT_SETT_WITH_GATES,
    OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
    DAMAGE_A_SETT,
    DESTROY_A_SETT,
    DISTURB_A_SETT
  }
}
const pageName = 'habitat-activities'

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const habData = journeyData.habitatData
  const id = habData.id || uuidv4()
  const methodIds = pageData.payload[pageName].map(method => parseInt(method))
  const active = habData.numberOfEntrances > 0 && habData.numberOfActiveEntrances > 0
  const speciesId = BADGER
  const activityId = INTERFERE_WITH_BADGER_SETT
  Object.assign(journeyData.habitatData, { id, methodIds, active, speciesId, activityId })
  await APIRequests.HABITAT.create(journeyData.habitatData.applicationId, journeyData.habitatData)
  request.cache().setData(journeyData)
}

export const validator = async payload => {
  if (!payload[pageName]) {
    const activities = pageName

    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no way of affecting the sett has been selected',
      path: [activities],
      type: 'no-checkbox-selected',
      context: {
        label: activities,
        value: 'Error',
        key: activities
      }
    }], null)
  }
}

export default pageRoute({ page: habitatURIs.ACTIVITIES.page, uri: habitatURIs.ACTIVITIES.uri, validator, completion, getData, setData })
