import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { gridReferenceRegex } from '../../common/common.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { getGridReferenceProximity } from './grid-reference-proximity.js'

export const completion = async request => {
  const { applicationId, siteData } = await request.cache().getData()

  const siteId = siteData?.id
  const site = await APIRequests.SITE.getSiteById(siteId)
  const { address, gridReference } = site
  const { xCoordinate, yCoordinate } = address
  const proximity = getGridReferenceProximity(gridReference, xCoordinate, yCoordinate)

  //  proximity test of 10 Km since it is large enough to cover most postcodes
  const proximityFlag = proximity > 10

  if (!proximityFlag) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
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
  await request.cache().clearPageData(siteURIs.SITE_GRID_REF.page)
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
    'site-grid-ref': Joi.string().trim().pattern(gridReferenceRegex).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
