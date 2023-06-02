import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'
import { timestampFormatter } from '../../common/common.js'
import { getNextPage } from '../common-return-functions.js'

const { WHY_NOT_COMPLETE_WITHIN_DATES } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  const startDate = timestampFormatter(licences[0]?.startDate)
  const endDate = timestampFormatter(licences[0]?.endDate)
  if (returnId) {
    const { whyNotCompletedWithinLicenceDates } = await APIRequests.RETURNS.getLicenceReturn(licences[0].id, returnId)
    return { whyNotCompletedWithinLicenceDates, startDate, endDate }
  } else {
    return { whyNotCompletedWithinLicenceDates: undefined, startDate, endDate }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const whyNotCompletedWithinLicenceDates = request?.payload['work-not-completed']
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, whyNotCompletedWithinLicenceDates }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, whyNotCompletedWithinLicenceDates }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const licenceActions = await APIRequests.RETURNS.getLicenceActions(journeyData?.licenceId)
  const methodTypes = licenceActions[0]?.methodIds
  journeyData.returns = {
    ...journeyData.returns,
    methodTypes: licenceActions[0]?.methodIds,
    methodTypesLength: methodTypes?.length,
    methodTypesNavigated: methodTypes?.length - 1
  }
  await request.cache().setData(journeyData)
  return getNextPage(methodTypes[0])
}

export default pageRoute({
  page: WHY_NOT_COMPLETE_WITHIN_DATES.page,
  uri: WHY_NOT_COMPLETE_WITHIN_DATES.uri,
  validator: Joi.object({
    'work-not-completed': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion: completion,
  checkData: checkApplication,
  getData: getData,
  setData: setData
})
