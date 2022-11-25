import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { moveTagInProgress, isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)

  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }
  return siteURIs.SITE_CHECK.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const { siteData, applicationId } = journeyData

  const gridReference = pageData.payload['site-grid-ref']
  const site = await APIRequests.SITE.findByApplicationId(applicationId)
  let siteInfo = {}
  if (site.length) {
    siteInfo = site[0]
  }
  const payload = { ...siteInfo, gridReference }
  await APIRequests.SITE.update(siteInfo.id, payload)
  journeyData.siteData = { ...siteData, gridReference }
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const site = await APIRequests.SITE.findByApplicationId(applicationId)
  let gridReference
  if (site.length) {
    gridReference = site[0]?.gridReference
  }
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
  return { gridReference }
}

export default pageRoute({
  page: siteURIs.SITE_GRID_REF.page,
  uri: siteURIs.SITE_GRID_REF.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'site-grid-ref': Joi.string().trim().pattern(/[a-zA-Z]{2}\d{6}/).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
