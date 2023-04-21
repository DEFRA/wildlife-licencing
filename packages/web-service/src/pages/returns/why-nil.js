import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { WHY_NIL } = ReturnsURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ReturnsURIs.WHY_NIL.uri
}

export default pageRoute({
  page: WHY_NIL.page,
  uri: WHY_NIL.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    'why-nil': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData: getData,
  completion: completion,
  setData: setData
})
