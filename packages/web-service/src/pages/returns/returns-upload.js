import { APIRequests } from '../../services/api-requests.js'
import { ReturnsURIs } from '../../uris.js'
import { boolFromYesNo } from '../common/common.js'
import { yesNoPage } from '../common/yes-no.js'
import { allCompletion, checkLicence } from './common-return-functions.js'

const { UPLOAD } = ReturnsURIs

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const returnsUpload = boolFromYesNo(request.payload['yes-no'])
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)

  const payload = { ...licenceReturn, returnsUpload }

  // User has just submitted that they wish to upload a file so prepare state machine to navigate to the upload file page next
  if (returnsUpload === true) {
    payload.uploadAnotherFile = true
  }

  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, returnsUpload }
  await request.cache().setData(journeyData)
}

export const returnUpload = yesNoPage({
  page: UPLOAD.page,
  uri: UPLOAD.uri,
  checkData: checkLicence,
  setData: setData,
  completion: allCompletion
})
