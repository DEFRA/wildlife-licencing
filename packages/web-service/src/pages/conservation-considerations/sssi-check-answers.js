import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ConservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SSSI_CHECK } = ConservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ConservationConsiderationURIs.SSSI_CHECK.uri
}

export default pageRoute({
  page: SSSI_CHECK.page,
  uri: SSSI_CHECK.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
