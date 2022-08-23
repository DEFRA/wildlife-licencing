import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { validateDates } from '../../../utils/date-validator.js'

export const completion = async _request => habitatURIs.WORK_END.uri

export const validator = async payload => {
  validateDates(payload, 'habitat-work-start')

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
