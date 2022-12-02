import { Backlink } from '../../../handlers/backlink.js'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { APPLICATIONS, siteURIs, TASKLIST } from '../../../uris.js'
import { addressLine } from '../../service/address.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  let siteId
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
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

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  if (!applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  // Mark the site journey tag as complete
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE })

  return TASKLIST.uri
}

export default pageRoute({
  page: siteURIs.CHECK_SITE_ANSWERS.page,
  uri: siteURIs.CHECK_SITE_ANSWERS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData,
  getData,
  completion
})
