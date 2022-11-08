import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { getGridReferenceProximity } from './grid-reference-proximity.js'

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  let redirectUrl = siteURIs.CHECK_SITE_ANSWERS.uri

  if (pageData?.payload['address-and-grid-reference-mismatch'] === 'address') {
    redirectUrl = siteURIs.SITE_GOT_POSTCODE.uri
  } else if (pageData?.payload['address-and-grid-reference-mismatch'] === 'gridReference') {
    redirectUrl = siteURIs.SITE_GRID_REF.uri
  }

  return redirectUrl
}

const siteAddressLine1 = c => [
  c?.subBuildingName,
  c?.buildingName,
  c?.buildingNumber,
  c?.street,
  c?.addressLine1
].filter(a => a).join(', ')

const siteAddressLine = c => [
  siteAddressLine1(c),
  c?.locality,
  c?.dependentLocality,
  c?.addressLine2,
  c?.town,
  c?.county,
  c?.postcode
].filter(a => a).join(', ')

export const getData = async request => {
  const siteId = (await request.cache().getData())?.siteData?.id
  const { address, gridReference } = await APIRequests.SITE.getSiteById(siteId)
  const { xCoordinate, yCoordinate } = address
  const proximity = getGridReferenceProximity(gridReference, xCoordinate, yCoordinate)

  const data = {}
  const siteAddress = siteAddressLine(address)
  //  proximity test of 10 Km since it is large enough to cover most postcodes
  const proximityFlag = proximity > 10
  Object.assign(data, { siteAddress, proximityFlag, gridReference })
  return data
}

export default pageRoute({
  page: siteURIs.SITE_CHECK.page,
  uri: siteURIs.SITE_CHECK.uri,
  validator: Joi.object({
    'address-and-grid-reference-mismatch': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  completion
})
