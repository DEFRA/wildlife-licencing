import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

const { WHY_NO_ARTIFICIAL_SETT } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return WHY_NO_ARTIFICIAL_SETT.uri
}

export default pageRoute({
  page: WHY_NO_ARTIFICIAL_SETT.page,
  uri: WHY_NO_ARTIFICIAL_SETT.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
