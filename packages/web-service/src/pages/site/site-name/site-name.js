import pageRoute from '../../../routes/page-route.js'
import { siteURIs, TASKLIST } from '../../../uris.js'
import { checkApplication } from '../../habitat/a24/common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { moveTagInProgress } from '../../common/tag-functions.js'

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  // Example (1) Create a new site with the name from the request
  const site = await APIRequests.SITE.create(applicationId, { name: request.payload['site-name'] })

  // Example (2) update the site data. For example, store the name of the file after successful file upload
  await APIRequests.SITE.update(site.id, { name: 'site name', siteMapFiles: { activity: 'activity.txt' } })

  // Example (3) list the sites associated with an application. For a24 there is only one
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  console.log(JSON.stringify(sites, null, 4))

  // Example (4) list the sites associated with an application. For a24 there is only one
  await APIRequests.SITE.destroy(applicationId, site.id)
  const sites2 = await APIRequests.SITE.findByApplicationId(applicationId)
  console.log(JSON.stringify(sites2, null, 4))
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
}

export default pageRoute({
  page: siteURIs.NAME.page,
  uri: siteURIs.NAME.uri,
  checkData: checkApplication,
  completion: () => TASKLIST.uri,
  setData: setData,
  getData
})
