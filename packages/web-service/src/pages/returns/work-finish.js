import { ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { isDateInFuture } from '../habitat/a24/common/date-validator.js'
import { validatePageDate } from '../../common/date-utils.js'
import { APIRequests } from '../../services/api-requests.js'
import pageRoute from '../../routes/page-route.js'

const { WORK_END, A24 } = ReturnsURIs

export const validator = payload => {
  const endDate = validatePageDate(payload, WORK_END.page)

  isDateInFuture(endDate, WORK_END.page)

  return null
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.returnId
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  if (returnId) {
    const { endDate } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    if (endDate) {
      return {
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1,
        day: endDate.getDate()
      }
    }
  }
  return null
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const endDate = request?.payload['work-end']
  const returnId = journeyData?.returns?.returnId
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
