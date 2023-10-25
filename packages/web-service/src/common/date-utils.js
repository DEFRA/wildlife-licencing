import isWithinInterval from 'date-fns/isWithinInterval/index.js'
import { throwJoiError } from '../pages/habitat/a24/common/error-handler.js'
import { parseISO } from 'date-fns'

/**
 * Determines if we are currently in a season, or window
 * @param {Date} dt - the test date
 * @param startWindow - object { ${number} date, ${number} month }
 * @param endWindow - object { ${number} date, ${number} month }
 * @returns {boolean|*}
 */

export const inDateWindow = (dt, startWindow, endWindow) => {
  const { date: windowStartDate, month: windowStartMonth } = startWindow
  const { date: windowEndDate, month: windowEndMonth } = endWindow

  // Date forced to UTC
  const windowStart = new Date(Date.UTC(dt.getFullYear(), windowStartMonth - 1, windowStartDate, 0, 0, 0))
  const windowEnd = new Date(Date.UTC(dt.getFullYear(), windowEndMonth - 1, windowEndDate, 0, 0, 0))

  if (windowEnd < windowStart) {
    const firstWindowStart = new Date(windowStart.valueOf())
    const secondWindowEnd = new Date(windowEnd.valueOf())
    firstWindowStart.setFullYear(firstWindowStart.getFullYear() - 1)
    secondWindowEnd.setFullYear(secondWindowEnd.getFullYear() + 1)
    return isWithinInterval(dt, { start: firstWindowStart, end: windowEnd }) ||
      isWithinInterval(dt, { start: windowStart, end: secondWindowEnd })
  }

  return isWithinInterval(dt, { start: windowStart, end: windowEnd })
}

/**
 * Validate a date payload and return a javascript date
 * @param payload - generally the name of the page from uri.name. Match the template
 * @param pageName
 * @returns {Date}
 */
export const validatePageDate = (payload, pageName) => {
  const day = payload[`${pageName}-day`]
  const month = payload[`${pageName}-month`]
  const year = payload[`${pageName}-year`]

  // Date validation
  if (day === '' || month === '' || year === '' || year.length < 4 || year < 1900) {
    throwJoiError(pageName, 'Error', 'noDateSent')
  }

  // Force UTC using ISO 8601
  const pageDate = getUTCDateOnly(year, month, day)

  if (isNaN(pageDate.valueOf())) {
    throwJoiError(pageName, null, 'invalidDate')
  }

  return pageDate
}

// Force UTC using ISO 8601
const getUTCDateOnly = (year, month, date) => {
  const dateString = `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${date.padStart(2, '0')}T00:00:00Z`
  return parseISO(dateString)
}

export const extractDateFromPageDate = (payload, pageName) =>
  getUTCDateOnly(payload[`${pageName}-year`], payload[`${pageName}-month`], payload[`${pageName}-day`])
