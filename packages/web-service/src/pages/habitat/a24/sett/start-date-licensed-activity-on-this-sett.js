import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'
import { validateDateInFuture, validateDateInWindow } from '../common/date-validator.js'
import { extractDateFromPageDate, validatePageDate } from '../../../../common/date-utils.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { isEndDateBeforeStartDate, isStartAndEndDateWithinWindow } from './common/date/validators.js'
import { dateCompletion } from './common/date/dates.js'

const oldKey = 'habitat-work-start'
export const getData = async request => {
  const { habitatData } = await request.cache().getData()
  if (habitatData?.startDate) {
    const startDate = new Date(habitatData.startDate)
    return {
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      day: startDate.getDate()
    }
  }
  return null
}

export const validator = async (payload, context) => {
  const startDate = validatePageDate(payload, oldKey)
  validateDateInFuture(startDate, oldKey)
  validateDateInWindow(startDate, oldKey)

  // Validate the end date with the start date, if the end date is set
  const journeyData = await cacheDirect(context).getData()
  const { habitatData } = journeyData
  if (habitatData?.endDate) {
    const endDate = new Date(Date.parse(habitatData.endDate))

    isEndDateBeforeStartDate(startDate, endDate, oldKey)
    isStartAndEndDateWithinWindow(startDate, endDate, oldKey)
  }

  return payload
}

export const setData = async request => {
  const startDate = extractDateFromPageDate(request.payload, oldKey)
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { startDate })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { startDate })
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  return dateCompletion(journeyData, habitatURIs.WORK_END.uri)
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
