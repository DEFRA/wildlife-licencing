import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { getGridReferenceProximity } from './grid-reference-proximity.js'
import { gridReferenceValidator } from '../../common/grid-ref-validator.js'
import { tagStatus } from '../../../services/status-tags.js'

const siteGridReference = 'site-grid-ref'
export const validator = payload => gridReferenceValidator(payload, siteGridReference)

export const completion = async request => {
  const { applicationId, siteData } = await request.cache().getData()

  const siteId = siteData?.id
  const site = await APIRequests.SITE.getSiteById(siteId)
  const { address, gridReference } = site
  const { xCoordinate, yCoordinate } = address
  const proximity = getGridReferenceProximity(gridReference, xCoordinate, yCoordinate)
  //  proximity test of 10 Km since it is large enough to cover most postcodes
  const proximityFlag = proximity > 10

  if (proximity && !proximityFlag) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }
  return siteURIs.SITE_CHECK.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData

  const gridReference = pageData.payload['site-grid-ref']
  const site = await APIRequests.SITE.findByApplicationId(applicationId)
  let siteInfo = {}
  if (site.length) {
    siteInfo = site[0]
  }
  const payload = { ...siteInfo, gridReference }
  await APIRequests.SITE.update(siteInfo.id, payload)
  journeyData.siteData = { ...siteInfo, gridReference }
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
  validator,
  getData,
  setData,
  completion
})
