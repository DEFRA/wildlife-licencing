import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { addressLine } from '../../service/address.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  if (pageData?.payload['address-and-grid-reference-mismatch'] === 'address') {
    return siteURIs.SITE_GOT_POSTCODE.uri
  }
  if (pageData?.payload['address-and-grid-reference-mismatch'] === 'gridReference') {
    return siteURIs.SITE_GRID_REF.uri
  }

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })

  return siteURIs.CHECK_SITE_ANSWERS.uri
}

export const getData = async request => {
  const siteId = (await request.cache().getData())?.siteData?.id
  const site = await APIRequests.SITE.getSiteById(siteId)
  const { gridReference } = site

  const data = {}
  const siteAddress = addressLine(site)
  Object.assign(data, { siteAddress, gridReference })
  return data
}

export default pageRoute({
  page: siteURIs.SITE_CHECK.page,
  uri: siteURIs.SITE_CHECK.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'address-and-grid-reference-mismatch': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData
})
