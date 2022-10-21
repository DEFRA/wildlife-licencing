import pageRoute from '../../../routes/page-route.js'
import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../habitat/a24/common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'
import Joi from 'joi'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const getData = async request => {
  const siteName = (await request.cache().getData())
  const { name } = siteName
  return { name }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const siteName = request.payload['site-name']
  // Create a new site with the name from the request
  if (siteName) {
    const site = await APIRequests.SITE.create(journeyData.applicationId, { name: siteName })
    journeyData.siteData = Object.assign(journeyData.siteData || {}, { id: site.id, name: siteName })
    request.cache().setData(journeyData)
  }
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SITE)

  if (complete) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.SITE_GOT_POSTCODE.uri
}

export default pageRoute({
  page: siteURIs.NAME.page,
  uri: siteURIs.NAME.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'site-name': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
