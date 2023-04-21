import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

const { WHY_NOT_COMPLETE_WITHIN_DATES } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return WHY_NOT_COMPLETE_WITHIN_DATES.uri
}

export default pageRoute({
  page: WHY_NOT_COMPLETE_WITHIN_DATES.page,
  uri: WHY_NOT_COMPLETE_WITHIN_DATES.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
