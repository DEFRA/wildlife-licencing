import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ConservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SSSI_SITE_NAME } = ConservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ConservationConsiderationURIs.SSSI_SITE_NAME.uri
}

export default pageRoute({
  page: SSSI_SITE_NAME.page,
  uri: SSSI_SITE_NAME.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    'sssi-site-name': Joi.string()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
