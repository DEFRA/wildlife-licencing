import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { isDateInFuture } from '../habitat/a24/common/date-validator.js'
import { extractDateFromPageDate, validatePageDate } from '../../common/date-utils.js'
import { APIRequests } from '../../services/api-requests.js'
import { checkLicence } from './common-return-functions.js'

const { WORK_START, WORK_END } = ReturnsURIs

export const validator = async payload => {
  const startDate = validatePageDate(payload, WORK_START.page)

  isDateInFuture(startDate, WORK_START.page)

  return payload
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  if (returnId) {
    const { startDate } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    if (startDate) {
      const licenceReturnStartDate = new Date(startDate)
      return {
        year: licenceReturnStartDate.getFullYear(),
        month: licenceReturnStartDate.getMonth() + 1,
        day: licenceReturnStartDate.getDate()
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
  const startDate = extractDateFromPageDate(request.payload, WORK_START.page)
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, startDate }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, startDate }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: WORK_START.page,
  uri: WORK_START.uri,
  checkData: checkLicence,
  completion: WORK_END.uri,
  validator,
  getData,
  setData
})
