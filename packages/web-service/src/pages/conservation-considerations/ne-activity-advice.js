import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { ACTIVITY_ADVICE } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.ACTIVITY_ADVICE.uri
}

export default pageRoute({
  page: ACTIVITY_ADVICE.page,
  uri: ACTIVITY_ADVICE.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
