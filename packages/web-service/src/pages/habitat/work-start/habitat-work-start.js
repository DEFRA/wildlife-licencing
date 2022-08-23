import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

const badgerLicenceSeasonOpen = `05-01-${new Date().getFullYear()}` // 1st May
const badgerLicenceSeasonClose = `11-30-${new Date().getFullYear()}` // 30th Nov

export const completion = async _request => habitatURIs.WORK_END.uri

export const isDate = date => {
  const isValidDate = Date.parse(date)

  return !isNaN(isValidDate)
}

export const invalidDate = (day, month, year, dateString) => {
  if (day > 31 || day <= 0) {
    return true
  }

  if (month > 12 || month <= 0) {
    return true
  }

  return !(/^[\d-]*$/.test(dateString)) // Validate we just have dashes and numbers
}

export const validator = async payload => {
  const habitatWorkStart = 'habitat-work-start'
  const day = payload['habitat-work-start-day']
  const month = payload['habitat-work-start-month']
  const year = payload['habitat-work-start-year']
  const dateString = `${month}-${day}-${year}`

  // Empty user validation
  if (day === '' || month === '' || year === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no date has been sent',
      path: [habitatWorkStart],
      type: 'no-date-sent',
      context: {
        label: habitatWorkStart,
        value: 'Error',
        key: habitatWorkStart
      }
    }], null)
  }
  // We can immediately return on these values
  if (invalidDate(day, month, year, dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the date is invalid',
      path: [habitatWorkStart],
      type: 'invalidDate',
      context: {
        label: habitatWorkStart,
        value: 'Error',
        key: habitatWorkStart
      }
    }], null)
  }
  // Ensure the date conforms to a Date() object in JS
  if (!isDate(dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date cant be parsed from this string',
      path: [habitatWorkStart],
      type: 'invalidDate',
      context: {
        label: habitatWorkStart,
        value: 'Error',
        key: habitatWorkStart
      }
    }], null)
  }
  // Is this in the past?
  if ((new Date(dateString)) < (new Date())) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date has been chosen from the past',
      path: [habitatWorkStart],
      type: 'dateHasPassed',
      context: {
        label: habitatWorkStart,
        value: 'Error',
        key: habitatWorkStart
      }
    }], null)
  }

  // Is the start date within the licence period?
  // Is it after when the badger licence opens and before the badger licence end?
  if ((new Date(dateString)) < (new Date(badgerLicenceSeasonOpen)) || (new Date(dateString)) > (new Date(badgerLicenceSeasonClose))) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date has been chosen from the past',
      path: [habitatWorkStart],
      type: 'outsideLicence',
      context: {
        label: habitatWorkStart,
        value: 'Error',
        key: habitatWorkStart
      }
    }], null)
  }

  return payload
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const day = pageData.payload['habitat-work-start-day']
  const month = pageData.payload['habitat-work-start-month']
  const year = pageData.payload['habitat-work-start-year']
  const workStart = `${month}-${day}-${year}`
  const journeyData = await request.cache().getData()
  journeyData.habitatData = Object.assign(journeyData.habitatData, { workStart })
  request.cache().setData(journeyData)
}

export default pageRoute({ page: habitatURIs.WORK_START.page, uri: habitatURIs.WORK_START.uri, setData, completion, validator })
