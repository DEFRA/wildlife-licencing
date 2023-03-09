import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { allCompletion, getCurrentSite, getFilteredDesignatedSites } from './common.js'

const { DESIGNATED_SITE_NAME } = conservationConsiderationURIs

export const getData = async request => {
  const sites = await getFilteredDesignatedSites()
  const ads = await getCurrentSite(request)
  if (ads) {
    return {
      sites: sites.map(s => ({ ...s, selected: s.id === ads.designatedSiteId }))
    }
  } else {
    // Creating a new ads, so remove sites that already that exist from the list
    const { applicationId } = await request.cache().getData()
    const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
    return { sites: sites.filter(s => !applicationDesignatedSites.map(ads => ads.designatedSiteId).includes(s.id)) }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const ads = await getCurrentSite(request)
  const sites = await getFilteredDesignatedSites()
  const siteId = sites.find(s => s.siteName === request.payload['site-name']).id
  if (!ads) {
    const newSite = await APIRequests.DESIGNATED_SITES.create(applicationId, { designatedSiteId: siteId })
    journeyData.designatedSite = { id: newSite.id, designatedSiteId: siteId }
    await request.cache().setData(journeyData)
  } else {
    // If the site is changing then update
    if (siteId !== ads.designatedSiteId) {
      await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, { designatedSiteId: siteId })
      journeyData.designatedSite = { id: ads.id, designatedSiteId: siteId }
      await request.cache().setData(journeyData)
    }
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
  completion: allCompletion,
  setData: setData
})
