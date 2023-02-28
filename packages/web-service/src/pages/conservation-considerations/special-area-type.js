import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SPECIAL_AREA_SITE_TYPE } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.SPECIAL_AREA_SITE_TYPE.uri
}

export default pageRoute({
  page: SPECIAL_AREA_SITE_TYPE.page,
  uri: SPECIAL_AREA_SITE_TYPE.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    'special-area-type': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
