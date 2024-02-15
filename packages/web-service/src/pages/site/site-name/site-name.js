import pageRoute from '../../../routes/page-route.js'
import { siteURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import Joi from 'joi'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { moveTagInProgress, isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { checkApplication } from '../../common/check-application.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  let name
  if (sites.length) {
    name = sites[0]?.name
  }
  return { name }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, siteData } = journeyData
  const siteName = request?.payload['site-name']?.trim()
  const singleSite = await APIRequests.SITE.findByApplicationId(applicationId)
  // Create a new site or update a site with the name from the request
  if (singleSite.length) {
    const siteInfo = singleSite[0]
    const payload = { ...siteInfo, name: siteName }
    await APIRequests.SITE.update(siteInfo.id, payload)
    journeyData.siteData = { ...siteData, id: siteInfo.id, name: siteName }
  } else {
    const site = await APIRequests.SITE.create(applicationId, { name: siteName })
    journeyData.siteData = { id: site.id, name: siteName }
  }

  await request.cache().setData(journeyData)
}

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()

  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  if (isCompleteOrConfirmed(appTagStatus)) {
    return h.redirect(siteURIs.CHECK_SITE_ANSWERS.uri)
  }

  return null
}

export default pageRoute({
  page: siteURIs.NAME.page,
  uri: siteURIs.NAME.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'site-name': Joi.string().trim().required().max(100)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion: siteURIs.SITE_GOT_POSTCODE.uri,
  getData,
  setData
})
