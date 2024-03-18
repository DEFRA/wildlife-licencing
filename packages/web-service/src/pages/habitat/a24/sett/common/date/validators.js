import Joi from 'joi'
import differenceInMonths from 'date-fns/differenceInMonths/index.js'
import { LicenceTypeConstants } from '../../../../../../common/licence-type-constants.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

export const isEndDateBeforeStartDate = (startDate, endDate, key) => {
  if (endDate < startDate) {
    throw new Joi.ValidationError('ValidationError', [{
      message: null,
      path: [key],
      type: 'endDateBeforeStart',
      context: {
        label: key,
        value: 'Error',
        key
      }
    }], null)
  }
}

export const isStartAndEndDateWithinWindow = (startDate, endDate, key) => {
  // Check the start and date are not further apart than the maximum allowed
  if (differenceInMonths(endDate, startDate) > LicenceTypeConstants[PowerPlatformKeys.APPLICATION_TYPES.A24].MAX_MONTHS_DURATION) {
    throw new Joi.ValidationError('ValidationError', [{
      message: null,
      path: [key],
      type: 'workTooLong',
      context: {
        label: key,
        value: 'Error',
        key
      }
    }], null)
  }
}
