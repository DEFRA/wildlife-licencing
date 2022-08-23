import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import Joi from 'joi'

const badgerLicenceSeasonOpen = `05-01-${new Date().getFullYear()}` // 1st May
const badgerLicenceSeasonClose = `11-30-${new Date().getFullYear()}` // 30th Nov

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

export const checkData = async request => {
  await request.cache().setPageData({ payload: await request.cache().getData() })
}

export const validator = async payload => {
  const habitatWorkEnd = 'habitat-work-end'
  const day = payload['habitat-work-end-day']
  const month = payload['habitat-work-end-month']
  const year = payload['habitat-work-end-year']
  const dateString = `${month}-${day}-${year}`
  // Empty user validation
  if (day === '' || month === '' || year === '') {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no date has been sent',
      path: [habitatWorkEnd],
      type: 'no-date-sent',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }

  // We can immediately return on these values
  if (invalidDate(day, month, year, dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the date is invalid',
      path: [habitatWorkEnd],
      type: 'invalidDate',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }

  // Ensure the date conforms to a Date() object in JS
  if (!isDate(dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: a date cant be parsed from this string',
      path: [habitatWorkEnd],
      type: 'invalidDate',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }

  const pastError = 'Error: a date has been chosen from the past'
  // Is this in the past?
  if ((new Date(dateString)) < (new Date())) {
    throw new Joi.ValidationError('ValidationError', [{
      message: pastError,
      path: [habitatWorkEnd],
      type: 'dateHasPassed',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }

  // Is the start date within the licence period?
  // Is it after when the badger licence opens and before the badger licence end?
  if ((new Date(dateString)) < (new Date(badgerLicenceSeasonOpen)) || (new Date(dateString)) > (new Date(badgerLicenceSeasonClose))) {
    throw new Joi.ValidationError('ValidationError', [{
      message: pastError,
      path: [habitatWorkEnd],
      type: 'outsideLicence',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }

  // Is the finish date after the start date?
  if (!new Date(dateString)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: pastError,
      path: [habitatWorkEnd],
      type: 'outsideLicence',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }

  return payload
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const day = pageData.payload['habitat-work-end-day']
  const month = pageData.payload['habitat-work-end-month']
  const year = pageData.payload['habitat-work-end-year']
  const workEnd = `${month}-${day}-${year}`
  const journeyData = await request.cache().getData()
  journeyData.habitatData = Object.assign(journeyData.habitatData, { workEnd })
  request.cache().setData(journeyData)
}

export const completion = async request => habitatURIs.ACTIVITIES.uri

export default pageRoute({ page: habitatURIs.WORK_END.page, uri: habitatURIs.WORK_END.uri, validator, completion, setData, checkData })
