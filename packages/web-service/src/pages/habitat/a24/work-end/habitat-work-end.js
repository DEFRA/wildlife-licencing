import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/general-sections.js'
import { validateDates } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

export const validator = async (payload, context) => {
  const journeyData = await cacheDirect(context).getData()
  validateDates(payload, habitatURIs.WORK_END.page)

  const day = payload[`${habitatURIs.WORK_END.page}-day`]
  const month = payload[`${habitatURIs.WORK_END.page}-month`]
  const year = payload[`${habitatURIs.WORK_END.page}-year`]
  const endDate = `${month}-${day}-${year}`
  const { habitatData } = journeyData
  const { startDate } = habitatData

  if (new Date(endDate) < new Date(startDate)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the user has entered an end date before the start date',
      path: [habitatURIs.WORK_END.page],
      type: 'endDateBeforeStart',
      context: {
        label: habitatURIs.WORK_END.page,
        value: 'Error',
        key: habitatURIs.WORK_END.page
      }
    }], null)
  }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const day = pageData.payload[`${habitatURIs.WORK_END.page}-day`]
  const month = pageData.payload[`${habitatURIs.WORK_END.page}-month`]
  const year = pageData.payload['habitat-work-end-year']
  const endDate = `${year.padStart(2, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { endDate })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { endDate })
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ACTIVITIES.uri
}

export const getData = async request => {
  const endDate = (await request.cache().getData())?.habitatData?.endDate || ''
  const [year, month, day] = endDate.split('-')
  return { year, month, day }
}

export default pageRoute({
  page: habitatURIs.WORK_END.page,
  uri: habitatURIs.WORK_END.uri,
  checkData: checkApplication,
  validator,
  completion,
  getData,
  setData
})
