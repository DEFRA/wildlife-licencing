import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { validateDates } from '../../../utils/date-validator.js'

export const validator = async payload => {
  validateDates(payload, 'habitat-work-end')

  // EXTRA VALIDATOR CHECKS
  // !! Need to pass start date in here !!
  // Is the finish date after the start date?
  // if (!new Date(dateString)) {
  //   throwJoiError('Error: an end date has been chosen before the start date', 'endDateBeforeStart')
  // }

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

export default pageRoute({ page: habitatURIs.WORK_END.page, uri: habitatURIs.WORK_END.uri, validator, completion, setData })
