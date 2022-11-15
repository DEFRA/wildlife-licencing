import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
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
  const { siteData } = journeyData
  const { name, address, siteMapFiles } = siteData
  const { activity, mitigationsDuringDevelopment, mitigationsAfterDevelopment } = siteMapFiles

  const gridReference = pageData.payload['site-grid-ref']
  const payload = { name, address, gridReference, siteMapFiles: { activity, mitigationsDuringDevelopment, mitigationsAfterDevelopment } }
  await APIRequests.SITE.update(siteData.id, payload)
  journeyData.siteData = Object.assign(journeyData.siteData, { gridReference })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const siteData = await request.cache().getData()
  const { applicationId, gridReference } = siteData
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
  return { gridReference }
}

export default pageRoute({
  page: siteURIs.SITE_GRID_REF.page,
  uri: siteURIs.SITE_GRID_REF.uri,
  validator: Joi.object({
    'site-grid-ref': Joi.string().trim().pattern(/[a-zA-Z]{2}\d{6}/).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
