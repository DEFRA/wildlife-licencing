import { throwJoiError } from './error-handler.js'
import { isDate } from '../../../../common/is-date.js'
import { isDateInvalid } from '../../../../common/is-date-invalid.js'

export const validateDates = (payload, pageName) => {
  const day = payload[`${pageName}-day`]
  const month = payload[`${pageName}-month`]
  const year = payload[`${pageName}-year`]

  const badgerSeasonOpen = `05-01-${year}`
  const badgerSeasonClose = `11-30-${year}`

  const dateString = `${month}-${day}-${year}`

  // Empty user validation
  if (day === '' || month === '' || year === '') {
    throwJoiError(pageName, 'Error: no date has been sent', 'noDateSent')
  }

  // We can immediately return on these values
  if (isDateInvalid(day, month, dateString)) {
    throwJoiError(pageName, 'Error: the date is invalid', 'invalidDate')
  }

  // Ensure the date conforms to a Date() object in JS
  if (!isDate(dateString)) {
    throwJoiError(pageName, 'Error: a date cant be parsed from this string', 'invalidDate')
  }

  // Is this in the past?
  if ((new Date(dateString)) < (new Date())) {
    throwJoiError(pageName, 'Error: a date has been chosen from the past', 'dateHasPassed')
  }

  // Is the start date within the licence period?
  // Is it after when the badger licence opens and before the badger licence end?
  if ((new Date(dateString)) < (new Date(badgerSeasonOpen)) || (new Date(dateString)) > (new Date(badgerSeasonClose))) {
    throwJoiError(pageName, 'Error: a date has been chosen outside the licence period', 'outsideLicence')
  }

  if (year.length !== 4) {
    throwJoiError(pageName, 'Error: the year has to be 4 digits long', 'yearCantAbbreviate')
  }
}
