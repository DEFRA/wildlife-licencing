import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { METHOD_IDS: { DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, OBSTRUCT_SETT_WITH_GATES } } = PowerPlatformKeys

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

const validator = async payload => {
  if (!payload['habitat-activities']) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no way of affecting the sett has been selected',
      path: ['habitat-activities'],
      type: 'no-checkbox-selected',
      context: {
        label: 'habitat-activities',
        value: 'Error',
        key: 'habitat-activities'
      }
    }], null)
  }
}

export default pageRoute({ page: habitatURIs.ACTIVITIES.page, uri: habitatURIs.ACTIVITIES.uri, validator, completion, getData })
