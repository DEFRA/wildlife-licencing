import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { getDesignatedSites } from './common.js'

const { SITE_OF_SPECIAL_SCIENTIFIC_INTEREST } = PowerPlatformKeys.SITE_TYPE
const { SSSI_SITE_NAME } = conservationConsiderationURIs

export const getData = async () => {
  return {
    sites: await getDesignatedSites(SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  }
}

export const validator = async payload => {
  const id = payload.id
  const ids = (await getDesignatedSites(SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)).map(d => d.id)
  Joi.assert({ id }, Joi.object({
    id: Joi.string().required().valid(...ids)
  }).options({ abortEarly: false, allowUnknown: true }))
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationDesignatedSites = await APIRequests.DESIGNATED_SITES.get(applicationId)
  const sssi = applicationDesignatedSites.find(ads => ads.designatedSiteType === SITE_OF_SPECIAL_SCIENTIFIC_INTEREST)
  // See if there is an SSSI site (Only one)
  if (!sssi) {
    await APIRequests.DESIGNATED_SITES.create(applicationId, { designatedSiteId: request.payload.id })
  } else {
    // If the SSSI is not changing do nothing, or change the SSSI
    if (sssi.designatedSiteId !== request.payload.id) {
      await APIRequests.DESIGNATED_SITES.update(applicationId, sssi.id, { designatedSiteId: request.payload.id })
    }
  }
}

export const completion = async () => conservationConsiderationURIs.OWNER_PERMISSION.uri

export default pageRoute({
  page: SSSI_SITE_NAME.page,
  uri: SSSI_SITE_NAME.uri,
  checkData: checkApplication,
  validator: validator,
  getData: getData,
  completion: completion,
  setData: setData
})
