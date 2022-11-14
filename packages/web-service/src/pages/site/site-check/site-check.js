import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { addressLine } from '../../service/address.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { getGridReferenceProximity } from './grid-reference-proximity.js'

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  let redirectUrl = siteURIs.CHECK_SITE_ANSWERS.uri

  if (pageData?.payload['address-and-grid-reference-mismatch'] === 'address') {
    redirectUrl = siteURIs.SITE_GOT_POSTCODE.uri
  } else if (pageData?.payload['address-and-grid-reference-mismatch'] === 'gridReference') {
    redirectUrl = siteURIs.SITE_GRID_REF.uri
  }

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })

  return redirectUrl
}

export const getData = async request => {
  const siteId = (await request.cache().getData())?.siteData?.id
  const site = await APIRequests.SITE.getSiteById(siteId)
  const { address, gridReference } = site
  const { xCoordinate, yCoordinate } = address
  const proximity = getGridReferenceProximity(gridReference, xCoordinate, yCoordinate)

  const data = {}
  const siteAddress = addressLine(site)
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
