import { ReturnsURIs } from '../../../uris.js'
import { yesNoPage } from '../../common/yes-no.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkLicence } from '../common-return-functions.js'

const { ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE, ARTIFICIAL_SETT_EVIDENCE_FOUND } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  if (returnId) {
    const { artificialSettCreatedBeforeClosure } = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    return { yesNo: yesNoFromBool(artificialSettCreatedBeforeClosure) }
  } else {
    return { yesNo: undefined }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const artificialSettCreatedBeforeClosure = boolFromYesNo(request.payload['yes-no'])
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, artificialSettCreatedBeforeClosure }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, artificialSettCreatedBeforeClosure }
  await request.cache().setData(journeyData)
}

export const artificialSettCreatedBeforeClosurePage = yesNoPage({
  page: ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.page,
  uri: ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.uri,
  completion: ARTIFICIAL_SETT_EVIDENCE_FOUND.uri,
  checkData: checkLicence,
  getData: getData,
  setData: setData
})
