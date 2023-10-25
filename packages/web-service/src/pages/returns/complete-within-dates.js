import { ReturnsURIs } from '../../uris.js'
import { yesNoPage } from '../common/yes-no.js'
import { APIRequests } from '../../services/api-requests.js'
import { allCompletion, checkLicence } from './common-return-functions.js'
import { boolFromYesNo, yesNoFromBool, timestampFormatter } from '../common/common.js'

const { COMPLETE_WITHIN_DATES } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
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

export const completeWithinDates = yesNoPage({
  page: COMPLETE_WITHIN_DATES.page,
  uri: COMPLETE_WITHIN_DATES.uri,
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData
})
