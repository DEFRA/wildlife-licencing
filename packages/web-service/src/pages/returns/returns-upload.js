import { APIRequests } from '../../services/api-requests.js'
import { ReturnsURIs } from '../../uris.js'
import { boolFromYesNo } from '../common/common.js'
import { yesNoPage } from '../common/yes-no.js'
import { allCompletion, checkLicence } from './common-return-functions.js'

const { UPLOAD, UPLOAD_FILE, CHECK_YOUR_ANSWERS } = ReturnsURIs

export const completion = request => request?.payload['yes-no'] === 'yes' ? UPLOAD_FILE.uri : CHECK_YOUR_ANSWERS.uri

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const returnsUpload = boolFromYesNo(request.payload['yes-no'])
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, returnsUpload }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, returnsUpload }
  await request.cache().setData(journeyData)
}

export const returnUpload = yesNoPage({
  page: UPLOAD.page,
  uri: UPLOAD.uri,
  checkData: checkLicence,
  setData: setData,
  completion: async (request) => {
    const uri = await allCompletion(request)
    const otherUri = await completion(request)
    console.log('URIs match: ', uri === otherUri)
    console.log('new uri: ', uri, 'old uri: ', otherUri)
    return uri
  }
})
