import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

const { WELFARE_CONCERNS } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return WELFARE_CONCERNS.uri
}

export default pageRoute({
  page: WELFARE_CONCERNS.page,
  uri: WELFARE_CONCERNS.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
