import Joi from 'joi'
import differenceInMonths from 'date-fns/differenceInMonths/index.js'

import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { validateDateInWindow } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'
import { extractDateFromPageDate, validatePageDate } from '../../../../common/date-utils.js'
import { LicenceTypeConstants } from '../../../../common/licence-type-constants.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

export const checkHasStart = async (request, h) => {
  const { habitatData } = await request.cache().getData()

  if (!habitatData?.startDate) {
    return h.redirect(habitatURIs.WORK_START.uri)
  }

  return null
}

export const getData = async request => {
  const { habitatData } = await request.cache().getData()
  const endDate = new Date(habitatData.endDate)
  return {
    year: endDate.getFullYear(),
    month: endDate.getMonth() + 1,
    day: endDate.getDate()
  }
}

export const validator = async (payload, context) => {
  const endDate = validatePageDate(payload, habitatURIs.WORK_END.page)
  validateDateInWindow(endDate, habitatURIs.WORK_END.page)

  // Validate the end date with the start date
  const { habitatData } = await cacheDirect(context).getData()
  const startDate = new Date(Date.parse(habitatData.startDate))

  if (endDate < startDate) {
    throw new Joi.ValidationError('ValidationError', [{
      message: null,
      path: [habitatURIs.WORK_END.page],
      type: 'endDateBeforeStart',
      context: {
        label: habitatURIs.WORK_END.page,
        value: 'Error',
        key: habitatURIs.WORK_END.page
      }
    }], null)
  }

  // Check the start and date are not further apart than the maximum allowed
  if (differenceInMonths(endDate, startDate) > LicenceTypeConstants[PowerPlatformKeys.APPLICATION_TYPES.A24].MAX_MONTHS_DURATION) {
    throw new Joi.ValidationError('ValidationError', [{
      message: null,
      path: [habitatURIs.WORK_END.page],
      type: 'workTooLong',
      context: {
        label: habitatURIs.WORK_END.page,
        value: 'Error',
        key: habitatURIs.WORK_END.page
      }
    }], null)
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const endDate = extractDateFromPageDate(request.payload, habitatURIs.WORK_END.page)

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

export default pageRoute({
  page: habitatURIs.WORK_END.page,
  uri: habitatURIs.WORK_END.uri,
  checkData: [checkApplication, checkHasStart],
  validator,
  completion,
  getData,
  setData
})
