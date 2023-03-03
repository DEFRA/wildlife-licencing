import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { allowedTypes } from './common.js'

const { SPECIAL_AREA_SITE_NAME, SPECIAL_AREA_SITE_TYPE, SPECIAL_AREA_EFFECT } = conservationConsiderationURIs

const getSite = async request => {
  const siteName = request.payload['site-name']
  const nameMap = await APIRequests.DESIGNATED_SITES.getDesignatedSitesNameMap(allowedTypes)
  return nameMap.get(siteName)
}

export const getData = async () => {
  const nameMap = await APIRequests.DESIGNATED_SITES.getDesignatedSitesNameMap(allowedTypes)
  return { sites: [...nameMap.keys()].sort().map(s => ({ id: '', siteName: s })) }
}

export const setData = async request => {
  const site = await getSite(request)
  const specialSite = { siteName: request.payload['site-name'] }
  if (site.sites.length === 1) {
    specialSite.id = site.sites[0].id
  }
  const journeyData = await request.cache().getData()
  Object.assign(journeyData, { specialSite })
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const site = await getSite(request)
  if (site.sites.length === 1) {
    return SPECIAL_AREA_EFFECT.uri
  }
  return SPECIAL_AREA_SITE_TYPE.uri
}

export default pageRoute({
  page: SPECIAL_AREA_SITE_NAME.page,
  uri: SPECIAL_AREA_SITE_NAME.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'site-name': Joi.string()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
