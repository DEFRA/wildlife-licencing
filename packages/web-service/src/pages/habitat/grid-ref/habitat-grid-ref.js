import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.WORK_START.uri

export const validator = async payload => {
  const gridRef = payload['habitat-grid-ref']

  if (gridRef === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no grid ref has been sent',
      path: ['habitat-grid-ref'],
      type: 'no-reference-sent',
      context: {
        label: 'habitat-grid-ref',
        value: 'Error',
        key: 'habitat-grid-ref'
      }
    }], null)
  } else if (/[a-zA-Z]{2}\d{6}/.test(gridRef) === false) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: grid ref is invalid',
      path: ['habitat-grid-ref'],
      type: 'invalid-reference',
      context: {
        label: 'habitat-grid-ref',
        value: 'Error',
        key: 'habitat-grid-ref'
      }
    }], null)
  }

  return null
}

export default pageRoute({ page: habitatURIs.GRID_REF.page, uri: habitatURIs.GRID_REF.uri, completion, validator })
