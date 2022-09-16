import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { validateDates } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'

export const validator = async (payload, context) => {
  const journeyData = await cacheDirect(context).getData()
  validateDates(payload, 'habitat-work-end')

  const habitatWorkEnd = 'habitat-work-end'
  const day = payload['habitat-work-end-day']
  const month = payload['habitat-work-end-month']
  const year = payload['habitat-work-end-year']
  const workEnd = `${month}-${day}-${year}`
  const { habitatData } = journeyData
  const { workStart } = habitatData

  if (new Date(workEnd) < new Date(workStart)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the user has entered an end date before the start date',
      path: [habitatWorkEnd],
      type: 'endDateBeforeStart',
      context: {
        label: habitatWorkEnd,
        value: 'Error',
        key: habitatWorkEnd
      }
    }], null)
  }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const day = pageData.payload['habitat-work-end-day']
  const month = pageData.payload['habitat-work-end-month']
  const year = pageData.payload['habitat-work-end-year']
  const workEnd = `${month}-${day}-${year}`

  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SETTS)
  if (complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { workEnd })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { workEnd })
  request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()

  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SETTS)
  if (complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ACTIVITIES.uri
}

export const getData = async request => {
  const workEnd = (await request.cache().getData())?.habitatData?.workEnd || ''
  const [day, month, year] = workEnd.split('-')
  return { day, month, year }
}

export default pageRoute({
  page: habitatURIs.WORK_END.page,
  uri: habitatURIs.WORK_END.uri,
  validator,
  completion,
  getData,
  setData
})
