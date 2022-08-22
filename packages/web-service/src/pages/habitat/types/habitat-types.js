import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER } } = PowerPlatformKeys

export const completion = async _request => habitatURIs.REOPEN.uri

const getData = () => {
  return {
    MAIN_NO_ALTERNATIVE_SETT,
    ANNEXE,
    SUBSIDIARY,
    OUTLIER
  }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const settType = pageData.payload['habitat-types']
  const journeyData = await request.cache().getData()
  request.cache().setData(Object.assign(journeyData, { settType }))
}

export default pageRoute({
  page: habitatURIs.TYPES.page,
  uri: habitatURIs.TYPES.uri,
  validator: Joi.object({
    'habitat-types': Joi.any().valid(
      MAIN_NO_ALTERNATIVE_SETT.toString(),
      ANNEXE.toString(),
      SUBSIDIARY.toString(),
      OUTLIER.toString()
    ).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData,
  setData
})
