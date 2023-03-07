import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { getFilteredDesignatedSites } from './common.js'

const { DESIGNATED_SITE_NAME } = conservationConsiderationURIs

// {
//   const cn = a.siteName.localeCompare(b.siteName)
//   return cn === 0 ? b.siteType - a.siteType : cn
// }

export const getData = async request => {
  const sites = await getFilteredDesignatedSites()
  console.log(sites)
  return {
    sites: sites.map(s => ({ ...s }))
  }
  // const { applicationId } = await request.cache().getDa`zta()
  // const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  // const sssi = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  // const sites = await getDesignatedSitesNameMap(SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  // if (sssi) {
  //   return {
  //     sites: sites.map(s => ({ ...s, selected: s.id === sssi.designatedSiteId }))
  //   }
  // } else {
  //   return { sites }
  // }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, designatedSite } = journeyData
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  if (!applicationDesignatedSites.find(ads => ads.designatedSiteId === designatedSite?.designatedSiteId)) {
    const sites = await getFilteredDesignatedSites()
    const siteId = sites.find(s => s.siteName === request.payload['site-name']).id
    const newSite = await APIRequests.DESIGNATED_SITES.create(applicationId, { designatedSiteId: siteId })
    journeyData.designatedSite = { id: newSite.id, designatedSiteId: siteId }
    await request.cache().setData(journeyData)
  }
}

export default pageRoute({
  page: DESIGNATED_SITE_NAME.page,
  uri: DESIGNATED_SITE_NAME.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'site-name': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: conservationConsiderationURIs.OWNER_PERMISSION.uri,
  setData: setData
})
