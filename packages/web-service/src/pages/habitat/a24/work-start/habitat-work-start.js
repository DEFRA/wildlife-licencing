import differenceInMonths from 'date-fns/differenceInMonths/index.js'
import Joi from 'joi'

import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'
import { validateDateInWindow } from '../common/date-validator.js'
import { extractDateFromPageDate, validatePageDate } from '../../../../common/date-utils.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
import { LicenceTypeConstants } from '../../../../common/licence-type-constants.js'

import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

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
  const startDate = validatePageDate(payload, habitatURIs.WORK_START.page)
  validateDateInWindow(startDate, habitatURIs.WORK_START.page)

  // Validate the end date with the start date, if the end date is set
  const journeyData = await cacheDirect(context).getData()
  const { habitatData } = journeyData
  if (habitatData.endDate) {
    const endDate = new Date(Date.parse(habitatData.endDate))

    if (endDate < startDate) {
      throw new Joi.ValidationError('ValidationError', [{
        message: null,
        path: [habitatURIs.WORK_START.page],
        type: 'endDateBeforeStart',
        context: {
          label: habitatURIs.WORK_START.page,
          value: 'Error',
          key: habitatURIs.WORK_START.page
        }
      }], null)
    }

    // Check the start and date are not further apart than the maximum allowed
    if (differenceInMonths(endDate, startDate) > LicenceTypeConstants[PowerPlatformKeys.APPLICATION_TYPES.A24].MAX_MONTHS_DURATION) {
      throw new Joi.ValidationError('ValidationError', [{
        message: null,
        path: [habitatURIs.WORK_START.page],
        type: 'workTooLong',
        context: {
          label: habitatURIs.WORK_START.page,
          value: 'Error',
          key: habitatURIs.WORK_START.page
        }
      }], null)
    }
  }

  return payload
}

export const setData = async request => {
  const startDate = extractDateFromPageDate(request.payload, habitatURIs.WORK_START.page)
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
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_END.uri
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
