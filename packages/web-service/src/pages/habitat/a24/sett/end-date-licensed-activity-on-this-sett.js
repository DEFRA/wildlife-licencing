import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { validateDateInFuture, validateDateInWindow } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'
import { extractDateFromPageDate, validatePageDate } from '../../../../common/date-utils.js'
import { dateCompletion, getDateData } from './common/date/dates.js'
import { isEndDateBeforeStartDate, isStartAndEndDateWithinWindow } from './common/date/validators.js'

const oldKey = 'habitat-work-end'
export const checkHasStart = async (request, h) => {
  const { habitatData } = await request.cache().getData()

  if (!habitatData?.startDate) {
    return h.redirect(habitatURIs.WORK_START.uri)
  }

  return null
}

export const getData = async request => {
  const { habitatData } = await request.cache().getData()
  return getDateData(habitatData?.endDate)
}

export const validator = async (payload, context) => {
  const endDate = validatePageDate(payload, oldKey)
  validateDateInFuture(endDate, oldKey)
  validateDateInWindow(endDate, oldKey)

  // Validate the end date with the start date
  const { habitatData } = await cacheDirect(context).getData()
  const startDate = new Date(Date.parse(habitatData.startDate))

  isEndDateBeforeStartDate(startDate, endDate, oldKey)
  isStartAndEndDateWithinWindow(startDate, endDate, oldKey)
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const endDate = extractDateFromPageDate(request.payload, oldKey)

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
  return dateCompletion(journeyData, habitatURIs.ACTIVITIES.uri)
}

export default pageRoute({
  page: habitatURIs.WORK_END.page,
  uri: habitatURIs.WORK_END.uri,
  checkData: [checkApplication, checkHasStart],
  validator,
  completion,
  getData,
  setData
})
