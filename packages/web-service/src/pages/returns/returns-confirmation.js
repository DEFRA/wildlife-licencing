import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { Backlink } from '../../handlers/backlink.js'
import { checkLicence } from './common-return-functions.js'

const { CONFIRMATION } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { returns, licenceId } = journeyData
  const currentReturnReferenceNumber = returns?.returnReferenceNumber
  const licenceReturns = await APIRequests.RETURNS.getLicenceReturns(licenceId)
  const licenceReturn = licenceReturns?.find(returnData => returnData.returnReferenceNumber === currentReturnReferenceNumber)
  const returnReferenceNumber = licenceReturn?.returnReferenceNumber
  const nilReturn = licenceReturn?.nilReturn
  return { returnReferenceNumber, nilReturn }
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData?.returns
  await request.cache().setData(journeyData)

  return APPLICATIONS.uri
}

export default pageRoute({
  page: CONFIRMATION.page,
  uri: CONFIRMATION.uri,
  backlink: Backlink.NO_BACKLINK,
  completion: completion,
  checkData: checkLicence,
  getData: getData
})
