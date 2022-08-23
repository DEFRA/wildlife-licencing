import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { invalidDate } from '../../../utils/invalid-date.js'
import { isDate } from '../../../utils/is-date.js'

const badgerLicenceSeasonOpen = `05-01-${new Date().getFullYear()}` // 1st May
const badgerLicenceSeasonClose = `11-30-${new Date().getFullYear()}` // 30th Nov

export const completion = async _request => habitatURIs.WORK_END.uri

export const throwJoiError = (message, type) => {
  const habitatStart = 'habitat-work-start'
  throw new Joi.ValidationError('ValidationError', [{
    message: message,
    path: [habitatStart],
    type: type,
    context: {
      label: habitatStart,
      value: 'Error',
      key: habitatStart
    }
  }], null)
}

export const validator = async payload => {
  const day = payload['habitat-work-start-day']
  const month = payload['habitat-work-start-month']
  const year = payload['habitat-work-start-year']
  const dateString = `${month}-${day}-${year}`

  // Empty user validation
  if (day === '' || month === '' || year === '') {
    throwJoiError('Error: no date has been sent', 'no-date-sent')
  }
  // We can immediately return on these values
  if (invalidDate(day, month, dateString)) {
    throwJoiError('Error: the start date is invalid', 'invalidDate')
  }
  // Ensure the date conforms to a Date() object in JS
  if (!isDate(dateString)) {
    throwJoiError('Error: a start date cant be parsed from this string', 'invalidDate')
  }
  // Is this in the past?
  if ((new Date(dateString)) < (new Date())) {
    throwJoiError('Error: a start date has been chosen from the past', 'dateHasPassed')
  }

  // Is the start date within the licence period?
  // Is it after when the badger licence opens and before the badger licence end?
  if ((new Date(dateString)) > (new Date(badgerLicenceSeasonClose)) || (new Date(dateString)) < (new Date(badgerLicenceSeasonOpen))) {
    throwJoiError('Error: a start date has been chosen outside the licence period', 'outsideLicence')
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
