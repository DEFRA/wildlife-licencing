import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { invalidDate } from '../../../utils/invalid-date.js'
import { isDate } from '../../../utils/is-date.js'

const badgerLicenceSeasonOpen = `05-01-${new Date().getFullYear()}` // 1st May
const badgerLicenceSeasonClose = `11-30-${new Date().getFullYear()}` // 30th Nov

const checkData = async request => {
  await request.cache().setPageData({ payload: await request.cache().getData() })
}

export const throwJoiError = (message, type) => {
  throw new Joi.ValidationError('ValidationError', [{
    message: message,
    path: ['habitat-work-end'],
    type: type,
    context: {
      label: 'habitat-work-end',
      value: 'Error',
      key: 'habitat-work-end'
    }
  }], null)
}

export const validator = async payload => {
  const day = payload['habitat-work-end-day']
  const month = payload['habitat-work-end-month']
  const year = payload['habitat-work-end-year']
  const dateString = `${month}-${day}-${year}`

  // Empty user validation
  if (day === '' || month === '' || year === '') {
    throwJoiError('Error: no date has been sent', 'no-date-sent')
  }

  // We can immediately return on these values
  if (invalidDate(day, month, dateString)) {
    throwJoiError('Error: the date is invalid', 'invalidDate')
  }

  // Ensure the date conforms to a Date() object in JS
  if (!isDate(dateString)) {
    throwJoiError('Error: a date cant be parsed from this string', 'invalidDate')
  }

  // Is this in the past?
  if ((new Date(dateString)) < (new Date())) {
    throwJoiError('Error: a date has been chosen from the past', 'dateHasPassed')
  }

  // Is the start date within the licence period?
  // Is it after when the badger licence opens and before the badger licence end?
  if ((new Date(dateString)) < (new Date(badgerLicenceSeasonOpen)) || (new Date(dateString)) > (new Date(badgerLicenceSeasonClose))) {
    throwJoiError('Error: a date has been chosen from the past', 'outsideLicence')
  }

  // Is the finish date after the start date?
  if (!new Date(dateString)) {
    throwJoiError('Error: an end date has been chosen before the start date', 'endDateBeforeStart')
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

export const completion = async _request => habitatURIs.ACTIVITIES.uri

export default pageRoute({ page: habitatURIs.WORK_END.page, uri: habitatURIs.WORK_END.uri, validator, completion, setData, checkData })
