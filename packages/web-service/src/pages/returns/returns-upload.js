import { APIRequests } from '../../services/api-requests.js'
import { ReturnsURIs } from '../../uris.js'
import { boolFromYesNo } from '../common/common.js'
import { yesNoPage } from '../common/yes-no.js'
import { allCompletion, checkLicence } from './common-return-functions.js'

const { UPLOAD } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  let returnsUpload
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    returnsUpload = licenceReturn?.returnsUpload
  }

  // Once the user has added files we don't want to show this question to the user again,
  // unless they remove all the files and then we want to default the value back to no
  const yesNo = returnsUpload === undefined ? undefined : 'no'

  return { yesNo }
}

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
  getData: getData,
  completion: allCompletion
})
