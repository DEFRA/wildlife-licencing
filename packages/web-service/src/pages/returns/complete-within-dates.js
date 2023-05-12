import { ReturnsURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter, yesNoFromBool } from '../common/common.js'

const { COMPLETE_WITHIN_DATES, WORK_START, ANOTHER_LICENCE } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.returnId
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
  const completedWithinLicenceDates = isYes(request)
  const returnId = journeyData?.returns?.returnId
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, completedWithinLicenceDates }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...licenceReturn, completedWithinLicenceDates }
  await request.cache().setData(journeyData)
}

export const completion = async request => isYes(request) ? ANOTHER_LICENCE.uri : WORK_START.uri

export const completeWithinDates = yesNoPage({
  page: COMPLETE_WITHIN_DATES.page,
  uri: COMPLETE_WITHIN_DATES.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
