import { ReturnsURIs } from '../../uris.js'
import { yesNoPage } from '../common/yes-no.js'
import { APIRequests } from '../../services/api-requests.js'
import { checkLicence, getLicenceMethodTypes, getNextPage } from './common-return-functions.js'
import { boolFromYesNo, yesNoFromBool, timestampFormatter } from '../common/common.js'

const { COMPLETE_WITHIN_DATES, WORK_START } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  const startDate = timestampFormatter(licences[0]?.startDate)
  const endDate = timestampFormatter(licences[0]?.endDate)
  if (returnId) {
    const { completedWithinLicenceDates } = await APIRequests.RETURNS.getLicenceReturn(licences[0].id, returnId)
    return { yesNo: yesNoFromBool(completedWithinLicenceDates), startDate, endDate }
  } else {
    return { yesNo: undefined, startDate, endDate }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const completedWithinLicenceDates = boolFromYesNo(request.payload['yes-no'])
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, completedWithinLicenceDates }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, completedWithinLicenceDates }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  if (boolFromYesNo(request.payload['yes-no'])) {
    const journeyData = await request.cache().getData()
    const licenceActions = await APIRequests.RETURNS.getLicenceActions(journeyData?.licenceId)
    const methodTypes = getLicenceMethodTypes(licenceActions)
    journeyData.returns = {
      ...journeyData.returns,
      methodTypes,
      methodTypesLength: methodTypes?.length,
      methodTypesNavigated: methodTypes?.length - 1
    }
    await request.cache().setData(journeyData)
    return getNextPage(methodTypes[0])
  } else {
    return WORK_START.uri
  }
}

export const completeWithinDates = yesNoPage({
  page: COMPLETE_WITHIN_DATES.page,
  uri: COMPLETE_WITHIN_DATES.uri,
  checkData: checkLicence,
  getData: getData,
  completion: completion,
  setData: setData
})
