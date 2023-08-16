import { ReturnsURIs } from '../../uris.js'
import { yesNoPage } from '../common/yes-no.js'
import { APIRequests } from '../../services/api-requests.js'
import { boolFromYesNo, yesNoFromBool } from '../common/common.js'
import { checkLicence } from './common-return-functions.js'

const { ANOTHER_LICENCE, CHECK_YOUR_ANSWERS } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  if (returnId) {
    const { needAnotherLicence } = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    return { yesNo: yesNoFromBool(needAnotherLicence) }
  } else {
    return { yesNo: undefined }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const needAnotherLicence = boolFromYesNo(request.payload['yes-no'])
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, needAnotherLicence }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, needAnotherLicence }
  await request.cache().setData(journeyData)
}

export const anotherLicence = yesNoPage({
  page: ANOTHER_LICENCE.page,
  uri: ANOTHER_LICENCE.uri,
  completion: CHECK_YOUR_ANSWERS.uri,
  checkData: checkLicence,
  getData,
  setData
})
