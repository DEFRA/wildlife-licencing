import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { mapInputAddress } from '../../contact/common/address-form/address-form.js'
import { ukPostcodeRegex } from '../../contact/common/postcode/postcode-page.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const getData = async request => {
  await request.cache().clearPageData(siteURIs.ADDRESS_NO_LOOKUP.page)
  return { postCode: !request.query['no-postcode'] }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, applicationId } = journeyData

  const pageData = await request.cache().getPageData()
  const inputAddress = pageData.payload
  const apiAddress = mapInputAddress(inputAddress)
  delete journeyData.siteData.postcode
  const site = await APIRequests.SITE.findByApplicationId(applicationId)
  let siteInfo = {}
  if (site.length) {
    siteInfo = site[0]
  }
  const payload = { ...siteInfo, address: apiAddress }
  await APIRequests.SITE.update(siteInfo.id, payload)
  journeyData.siteData = { ...siteData, address: apiAddress }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()

  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.UPLOAD_MAP.uri
}

export default pageRoute({
  page: siteURIs.ADDRESS_NO_LOOKUP.page,
  uri: siteURIs.ADDRESS_NO_LOOKUP.uri,
  validator: Joi.object({
    'address-line-1': Joi.string().required().trim().pattern(/^[/\s\p{L}\d.,-]{1,80}$/u),
    'address-line-2': Joi.string().allow('').trim().pattern(/^[/\s\p{L}.,-]{1,80}$/u),
    'address-town': Joi.string().required().trim().pattern(/^[/\s\p{L}.,!-]{1,80}$/u),
    'address-county': Joi.string().allow('').trim().pattern(/^[/\s\p{L}]{1,80}$/u),
    'address-postcode': Joi.string().allow('').trim().min(1).max(12).pattern(ukPostcodeRegex)
      .replace(ukPostcodeRegex, '$1 $2').uppercase()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData,
  setData
})
