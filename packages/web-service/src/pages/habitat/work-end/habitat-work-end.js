import Joi from 'joi'
import { errorShim } from '../../../handlers/page-handler.js'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { validateDates } from '../../../utils/date-validator.js'

export const validator = async payload => {
  validateDates(payload, 'habitat-work-end')

  return payload
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const data = pageData.payload
  const habitatWorkEnd = 'habitat-work-end'
  const workEnd = `${data['habitat-work-end-month']}-${data['habitat-work-end-day']}-${data['habitat-work-end-year']}`

  // Is the finish date before the start date?
  // Ideally we should do this in the `validator`, but it doesn't have access
  // to the journeyData as it's too early in the lifecycle
  const journeyData = await request.cache().getData()
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

  journeyData.habitatData = Object.assign(journeyData.habitatData, { workEnd })
  request.cache().setData(journeyData)
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.error) {
    return habitatURIs.WORK_END.uri
  } else {
    return habitatURIs.ACTIVITIES.uri
  }
}

export default pageRoute({ page: habitatURIs.WORK_END.page, uri: habitatURIs.WORK_END.uri, validator, completion, setData })
