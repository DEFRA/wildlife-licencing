import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { Backlink } from '../../handlers/backlink.js'
import { checkLicence } from './common-return-functions.js'

const { CONFIRMATION } = ReturnsURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const licences = await APIRequests.LICENCES.findByApplicationId(applicationId)
  const licenceReturns = await APIRequests.RETURNS.getLicenceReturns(licences[0]?.id)
  const returnId = licenceReturns[licenceReturns.length - 1]?.id
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)

  return {
    returnReferenceNumber: licenceReturn?.returnReferenceNumber,
    nilReturn: licenceReturn?.nilReturn
  }
}

export default pageRoute({
  page: CONFIRMATION.page,
  uri: CONFIRMATION.uri,
  backlink: Backlink.NO_BACKLINK,
  completion: APPLICATIONS.uri,
  checkData: checkLicence,
  getData: getData
})
