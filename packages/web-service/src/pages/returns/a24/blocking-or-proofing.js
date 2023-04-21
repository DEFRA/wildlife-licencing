import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

const { BLOCKING_OR_PROOFING } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return BLOCKING_OR_PROOFING.uri
}

export default pageRoute({
  page: BLOCKING_OR_PROOFING.page,
  uri: BLOCKING_OR_PROOFING.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
