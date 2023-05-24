import { ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { isDateInFuture } from '../habitat/a24/common/date-validator.js'
import { extractDateFromPageDate, validatePageDate } from '../../common/date-utils.js'
import { APIRequests } from '../../services/api-requests.js'
import pageRoute from '../../routes/page-route.js'
import { cacheDirect } from '../../session-cache/cache-decorator.js'
import Joi from 'joi'

const { WORK_END, A24 } = ReturnsURIs

export const validator = async (payload, context) => {
  const endDate = validatePageDate(payload, WORK_END.page)

  isDateInFuture(endDate, WORK_END.page)

  // Validate the end date should be after the start date
  const journeyData = await cacheDirect(context).getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const returnData = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const startDate = new Date(Date.parse(returnData?.startDate))

  if (endDate < startDate) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: The end date must be after the start date',
      path: ['work-finish'],
      type: 'endDateBeforeStart',
      context: {
        label: 'work-finish',
        value: 'Error',
        key: 'work-finish'
      }
    }], null)
  }

  return payload
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  if (returnId) {
    const { endDate } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    if (endDate) {
      const licenceReturnEndDate = new Date(endDate)
      return {
        year: licenceReturnEndDate.getFullYear(),
        month: licenceReturnEndDate.getMonth() + 1,
        day: licenceReturnEndDate.getDate()
      }
    }

    return {
      year: undefined,
      month: undefined,
      day: undefined
    }
  }
  return null
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const endDate = extractDateFromPageDate(request?.payload, WORK_END.page)
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, endDate }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...licenceReturn, endDate }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: WORK_END.page,
  uri: WORK_END.uri,
  checkData: checkApplication,
  validator: validator,
  getData: getData,
  completion: A24.WHY_NOT_COMPLETE_WITHIN_DATES.uri,
  setData: setData
})
