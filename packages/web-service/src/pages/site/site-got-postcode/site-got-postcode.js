import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { siteURIs } from '../../../uris.js'
import { ukPostcodeRegex } from '../../contact/common/postcode/postcode-page.js'
import { addressLookupForPostcode } from '../../contact/common/postcode/postcode.js'

export const getData = async request => {
  const { siteData } = (await request.cache().getData())
  const { sitePostcode } = siteData
  return { sitePostcode }
}

// To do: when the user selects the site does not have a post code should be directed to the upload file
export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const sitePostcode = pageData.payload['site-postcode']

  // address lookup for the postcode from the request
  await request.cache().clearPageData(siteURIs.SELECT_ADDRESS.page)
  await addressLookupForPostcode(sitePostcode, journeyData, request)
  journeyData.siteData = Object.assign(journeyData.siteData || {}, { postcode: sitePostcode })
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  let redirectUrl = siteURIs.SELECT_ADDRESS.uri

  if (pageData?.payload['site-postcode-check'] === 'no') {
    redirectUrl = siteURIs.UPLOAD_MAP.uri
  }

  return redirectUrl
}

export default pageRoute({
  page: siteURIs.SITE_GOT_POSTCODE.page,
  uri: siteURIs.SITE_GOT_POSTCODE.uri,
  validator: Joi.object({
    'site-postcode-check': Joi.any()
      .valid('yes', 'no')
      .required(),
    'site-postcode': Joi.string().trim().min(1).max(12).required().pattern(ukPostcodeRegex)
      .replace(ukPostcodeRegex, '$1 $2').uppercase()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
