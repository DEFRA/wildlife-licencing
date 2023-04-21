import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

const { DAMAGE_BY_HAND_OR_MECHANICAL_MEANS } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri
}

export default pageRoute({
  page: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.page,
  uri: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
