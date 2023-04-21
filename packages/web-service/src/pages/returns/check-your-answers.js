import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { ReturnsURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { CHECK_ANSWERS } = ReturnsURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ReturnsURIs.CHECK_ANSWERS.uri
}

export default pageRoute({
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
