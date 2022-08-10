import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.TYPES.uri

export const validator = async payload => {
  if (payload['habitat-name'] === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no habitat name has been sent',
      path: ['habitat-name'],
      type: 'no-name-entered',
      context: {
        label: 'habitat-name',
        value: 'Error',
        key: 'habitat-name'
      }
    }], null)
  }
}

export default pageRoute({ page: habitatURIs.NAME.page, uri: habitatURIs.NAME.uri, completion, validator })
