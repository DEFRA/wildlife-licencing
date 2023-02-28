import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SPECIAL_AREA_SITE_NAME } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.SPECIAL_AREA_SITE_NAME.uri
}

export default pageRoute({
  page: SPECIAL_AREA_SITE_NAME.page,
  uri: SPECIAL_AREA_SITE_NAME.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    'special-area-site-name': Joi.string()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
