import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { isDateInFuture } from '../../habitat/a24/common/date-validator.js'
import { extractDateFromPageDate, validatePageDate } from '../../../common/date-utils.js'
import { checkLicence, licenceActionsCompletion } from '../common-return-functions.js'
import { APIRequests } from '../../../services/api-requests.js'

const { DESTROY_DATE } = ReturnsURIs.A24

export const validator = async payload => {
  const startDate = validatePageDate(payload, DESTROY_DATE.page)

  isDateInFuture(startDate, DESTROY_DATE.page)

  return payload
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { destroyDate } = journeyData?.returns
  if (destroyDate) {
    const licenceReturnDestroyDate = new Date(destroyDate)
    return {
      year: licenceReturnDestroyDate.getFullYear(),
      month: licenceReturnDestroyDate.getMonth() + 1,
      day: licenceReturnDestroyDate.getDate()
    }
  }

  return {
    year: undefined,
    month: undefined,
    day: undefined
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const destroyDate = extractDateFromPageDate(request.payload, DESTROY_DATE.page)
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, destroyDate }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, destroyDate }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: DESTROY_DATE.page,
  uri: DESTROY_DATE.uri,
  completion: licenceActionsCompletion,
  checkData: checkLicence,
  validator,
  getData,
  setData
})
