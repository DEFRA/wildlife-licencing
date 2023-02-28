import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ConservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { ACTIVITY_ADVICE } = ConservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ConservationConsiderationURIs.ACTIVITY_ADVICE.uri
}

export default pageRoute({
  page: ACTIVITY_ADVICE.page,
  uri: ACTIVITY_ADVICE.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
