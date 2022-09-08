import Joi from 'joi'
import { errorShim } from '../../../../handlers/page-handler.js'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { validateDates } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'

export const validator = async payload => {
  validateDates(payload, 'habitat-work-end')

  return payload
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const habitatWorkEnd = 'habitat-work-end'
  const day = pageData.payload['habitat-work-end-day']
  const month = pageData.payload['habitat-work-end-month']
  const year = pageData.payload['habitat-work-end-year']
  const workEnd = `${month}-${day}-${year}`

  // Is the finish date before the start date?
  // Ideally we should do this in the `validator`, but it doesn't have access
  // to the journeyData as it's too early in the lifecycle

  if (new Date(workEnd) < new Date(journeyData.habitatData.workStart)) {
    await request.cache().setPageData({
      payload: request.payload,
      error: errorShim(new Joi.ValidationError('ValidationError', [{
        message: 'Error: the user has entered an end date before the start date',
        path: [habitatWorkEnd],
        type: 'endDateBeforeStart',
        context: {
          label: habitatWorkEnd,
          value: 'Error',
          key: habitatWorkEnd
        }
      }]))
    })

    return
  }
  if (journeyData.complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { workEnd })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { workEnd })
  request.cache().setData(journeyData)
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  if (pageData.error) {
    return habitatURIs.WORK_END.uri
  }
  if (journeyData.complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ACTIVITIES.uri
}

export const getData = async request => {
  const workEnd = (await request.cache().getData())?.habitatData?.workEnd || ''
  const [day, month, year] = workEnd.split('-')
  console.log(day, month, year)
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
