import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { siteURIs } from '../../../uris.js'
import { ukPostcodeRegex } from '../../contact/common/postcode/postcode-page.js'
import { addressLookupForPostcode } from '../../contact/common/postcode/postcode.js'

const postcode = 'site-postcode'
const postcodeRadio = 'site-postcode-check'

export const validator = async payload => {
  if (!payload[postcode]) {
    Joi.assert(payload, Joi.object({
      'site-postcode-check': Joi.any().valid('yes', 'no').required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (!payload[postcode] && payload[postcodeRadio] === 'yes') {
    Joi.assert(payload, Joi.object({
      'site-postcode': Joi.string().trim().required().pattern(ukPostcodeRegex).replace(ukPostcodeRegex, '$1 $2').uppercase()
    }).options({ abortEarly: false, allowUnknown: true }))
  }
  return null
}

export const getData = async request => {
  const { siteData } = await request.cache().getData()
  const { sitePostcode } = siteData
  return { sitePostcode }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const sitePostcode = pageData.payload[postcode]

  // address lookup for the postcode from the request
  await request.cache().clearPageData(siteURIs.SELECT_ADDRESS.page)
  await addressLookupForPostcode(sitePostcode, journeyData, request)
  journeyData.siteData = Object.assign(journeyData.siteData, { postcode: sitePostcode })
  await request.cache().setData(journeyData)
}

// when the user selects the site does not have a post code should be directed to the upload file
export const completion = async request => {
  const pageData = await request.cache().getPageData()
  let redirectUrl = siteURIs.SELECT_ADDRESS.uri

  if (pageData?.payload[postcodeRadio] === 'no') {
    redirectUrl = siteURIs.UPLOAD_MAP.uri
  }

  return redirectUrl
}

export default pageRoute({
  page: siteURIs.SITE_GOT_POSTCODE.page,
  uri: siteURIs.SITE_GOT_POSTCODE.uri,
  validator,
  getData,
  setData,
  completion
})