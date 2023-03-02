import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { getDesignatedSites } from './common.js'

const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE
const { SSSI_SITE_NAME } = conservationConsiderationURIs

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssi = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  const sites = await getDesignatedSites(SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  if (sssi) {
    return {
      sites: sites.map(s => ({ ...s, selected: s.id === sssi.designatedSiteId }))
    }
  } else {
    return { sites }
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const sites = await getDesignatedSites(SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  const siteId = sites.find(s => s.siteName === request.payload['site-name']).id
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssi = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  // See if there is an SSSI site (Only one)
  if (!sssi) {
    await APIRequests.DESIGNATED_SITES.create(applicationId, { designatedSiteId: siteId })
  } else {
    // If the SSSI is not changing do nothing, or change the SSSI
    if (sssi.designatedSiteId !== siteId) {
      await APIRequests.DESIGNATED_SITES.update(applicationId, sssi.id, { designatedSiteId: siteId })
    }
  }
}

export default pageRoute({
  page: SSSI_SITE_NAME.page,
  uri: SSSI_SITE_NAME.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'site-name': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: conservationConsiderationURIs.OWNER_PERMISSION.uri,
  setData: setData
})
