import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import Joi from 'joi'
import { setData } from '../types/habitat-types.js'

const badgerLicenceSeasonOpen = `05-01-${new Date().getFullYear()}` // 1st May
const badgerLicenceSeasonClose = `11-30-${new Date().getFullYear()}` // 30th Nov

export const isDate = date => {
  const isValidDate = Date.parse(date)

  if (isNaN(isValidDate)) {
    return false
  }

  return true
}

export const invalidDate = (day, month, year, dateString) => {
  if (day > 31 || day <= 0) {
    return true
  }

  if (month > 12 || month <= 0) {
    return true
  }

  if (!(/^[\d-]*$/.test(dateString))) { // Validate we just have dashes and numbers
    return true
  }

  return false
}

const checkData = async request => {
  console.log('CD', await request.cache().getPageData())
  await request.cache().setPageData({ payload: await request.cache().getData() })
}

export const validator = async payload => {
  console.log('v', payload)
  const day = payload['habitat-work-end-day']
  const month = payload['habitat-work-end-month']
  const year = payload['habitat-work-end-year']
  const dateString = `${month}-${day}-${year}`
  // Empty user validation
  if (day === '' || month === '' || year === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no date has been sent',
      path: ['habitat-work-end'],
      type: 'no-date-sent',
      context: {
        label: 'habitat-work-end',
        value: 'Error',
        key: 'habitat-work-end'
      }
    }], null)
  }

  // We can immediately return on these values
  if (invalidDate(day, month, year, dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the date is invalid',
      path: ['habitat-work-end'],
      type: 'invalidDate',
      context: {
        label: 'habitat-work-end',
        value: 'Error',
        key: 'habitat-work-end'
      }
    }], null)
  }

  // Ensure the date conforms to a Date() object in JS
  if (!isDate(dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date cant be parsed from this string',
      path: ['habitat-work-end'],
      type: 'invalidDate',
      context: {
        label: 'habitat-work-end',
        value: 'Error',
        key: 'habitat-work-end'
      }
    }], null)
  }

  // Is this in the past?
  if ((new Date(dateString)) < (new Date())) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date has been chosen from the past',
      path: ['habitat-work-end'],
      type: 'dateHasPassed',
      context: {
        label: 'habitat-work-end',
        value: 'Error',
        key: 'habitat-work-end'
      }
    }], null)
  }

  // Is the start date within the licence period?
  // Is it after when the badger licence opens and before the badger licence end?
  if ((new Date(dateString)) < (new Date(badgerLicenceSeasonOpen)) || (new Date(dateString)) > (new Date(badgerLicenceSeasonClose))) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date has been chosen from the past',
      path: ['habitat-work-end'],
      type: 'outsideLicence',
      context: {
        label: 'habitat-work-end',
        value: 'Error',
        key: 'habitat-work-end'
      }
    }], null)
  }

  // Is the finish date after the start date?
  if (!new Date(dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date has been chosen from the past',
      path: ['habitat-work-end'],
      type: 'outsideLicence',
      context: {
        label: 'habitat-work-end',
        value: 'Error',
        key: 'habitat-work-end'
      }
    }], null)
  }

  return payload
}
export const completion = async _request => habitatURIs.ACTIVITIES.uri

export default pageRoute({ page: habitatURIs.WORK_END.page, uri: habitatURIs.WORK_END.uri, validator, completion, setData, checkData })
