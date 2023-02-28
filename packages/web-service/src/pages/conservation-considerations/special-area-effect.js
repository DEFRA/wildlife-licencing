import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ConservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SPECIAL_AREA_EFFECT } = ConservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ConservationConsiderationURIs.SPECIAL_AREA_EFFECT.uri
}

export default pageRoute({
  page: SPECIAL_AREA_EFFECT.page,
  uri: SPECIAL_AREA_EFFECT.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
