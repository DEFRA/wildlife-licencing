import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { OWNER_PERMISSION_DETAILS } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.OWNER_PERMISSION_DETAILS.uri
}

export default pageRoute({
  page: OWNER_PERMISSION_DETAILS.page,
  uri: OWNER_PERMISSION_DETAILS.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
