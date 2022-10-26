import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { habitatURIs } from '../../../../uris.js'
import { validateDates } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-is-complete-or-confirmed.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)
  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_END.uri
}

export const validator = async payload => {
  validateDates(payload, 'habitat-work-start')

  return payload
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const day = pageData.payload['habitat-work-start-day']
  const month = pageData.payload['habitat-work-start-month']
  const year = pageData.payload['habitat-work-start-year']
  const workStart = `${month}-${day}-${year}`

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)
  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { workStart })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { workStart })
  request.cache().setData(journeyData)
}

export const getData = async request => {
  const workStart = (await request.cache().getData())?.habitatData?.workStart || ''
  const [month, day, year] = workStart.split('-')
  return { month, day, year }
}

export default pageRoute({
  page: habitatURIs.WORK_START.page,
  uri: habitatURIs.WORK_START.uri,
  checkData: checkApplication,
  setData,
  getData,
  completion,
  validator
})
