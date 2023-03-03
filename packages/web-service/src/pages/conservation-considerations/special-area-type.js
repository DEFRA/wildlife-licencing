import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../services/api-requests.js'
const { SPECIAL_AREA_SITE_TYPE, SPECIAL_AREA_SITE_NAME } = conservationConsiderationURIs

export const checkData = async (request, h) => {
  const { specialSite } = await request.cache().getData()
  if (!specialSite.siteName) {
    return SPECIAL_AREA_SITE_NAME.url
  }

  return null
}

export const getData = async request => {
  // For the selected name, get the available types
  const { specialSite } = await request.cache().getData()
  const nameMap = await APIRequests.DESIGNATED_SITES.getDesignatedSitesNameMap()
  const siteMapEntry = nameMap.get(specialSite.siteName)
  return {
    siteTypes: Object.entries(PowerPlatformKeys.SITE_TYPE)
      .filter(([, v]) => siteMapEntry.sites
        .map(sme => sme.siteType)
        .includes(v))
      .map(st => ({ type: st[0], selected: false }))
  }
}

export const setData = async request => {
  console.log(request.payload)
}

export const completion = async request => {
  return conservationConsiderationURIs.SPECIAL_AREA_SITE_TYPE.uri
}

export default pageRoute({
  page: SPECIAL_AREA_SITE_TYPE.page,
  uri: SPECIAL_AREA_SITE_TYPE.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    'special-area-type': Joi.array().items(Joi.string().valid(...Object.keys(PowerPlatformKeys.SITE_TYPE))).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
