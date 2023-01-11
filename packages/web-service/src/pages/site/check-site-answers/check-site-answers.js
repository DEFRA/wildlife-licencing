import { Backlink } from '../../../handlers/backlink.js'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs, TASKLIST } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { addressLine } from '../../service/address.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { tagStatus } from '../../../services/status-tags.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  let siteId
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })

  for (const siteData of sites) {
    siteId = siteData.id
  }
  const site = await APIRequests.SITE.getSiteById(siteId)
  const siteAddress = addressLine(site)
  const result = []

  result.push({ key: 'siteName', value: site?.name })
  result.push({ key: 'siteAddress', value: siteAddress })
  result.push({ key: 'siteMap', value: site?.siteMapFiles?.activity })
  result.push({ key: 'siteMapTwo', value: site?.siteMapFiles?.mitigationsDuringDevelopment })
  result.push({ key: 'siteMapThree', value: site?.siteMapFiles?.mitigationsAfterDevelopment })
  result.push({ key: 'siteGridReference', value: site?.gridReference })
  return result
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData?.addressLookup

  await request.cache().setData(journeyData)
  // Mark the site journey tag as complete
  await APIRequests.APPLICATION.tags(journeyData?.applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE })

  return TASKLIST.uri
}

export default pageRoute({
  page: siteURIs.CHECK_SITE_ANSWERS.page,
  uri: siteURIs.CHECK_SITE_ANSWERS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: checkApplication,
  getData,
  completion
})
