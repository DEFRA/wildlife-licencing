import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { allCompletion, getCurrentSite, getFilteredDesignatedSites } from './common.js'

const { DESIGNATED_SITE_NAME } = conservationConsiderationURIs

export const getData = async request => {
  const designatedSites = await getFilteredDesignatedSites()
  const ads = await getCurrentSite(request)
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  // Remove sites that already that exist from the list

  if (ads) {
    // When modifying remove the existing sites except the currently selected on
    const sites = designatedSites.filter(s => !applicationDesignatedSites
      .filter(a => a.designatedSiteId !== ads.designatedSiteId)
      .map(a => a.designatedSiteId).includes(s.id))
      .map(s => ({ ...s, selected: s.id === ads.designatedSiteId }))
    return {
      sites: sites.map(s => ({ ...s, selected: s.id === ads.designatedSiteId }))
    }
  } else {
    // When adding remove all existing designated sites from the list
    return { sites: designatedSites.filter(s => !applicationDesignatedSites.map(a => a.designatedSiteId).includes(s.id)) }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const ads = await getCurrentSite(request)
  const sites = await getFilteredDesignatedSites()
  const siteId = sites.find(s => s.id === request.payload['site-id']).id
  if (!ads) {
    const newSite = await APIRequests.DESIGNATED_SITES.create(applicationId, { designatedSiteId: siteId })
    journeyData.designatedSite = { id: newSite.id, designatedSiteId: siteId }
    await request.cache().setData(journeyData)
  } else {
    // If the site is changing then update
    if (siteId !== ads.designatedSiteId) {
      ads.designatedSiteId = siteId
      await APIRequests.DESIGNATED_SITES.update(applicationId, ads.id, ads)
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
    'site-id': Joi.string().trim().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: allCompletion,
  setData: setData
})
