import Joi from 'joi'
import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA.uri
}

export default pageRoute({
  page: SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA.page,
  uri: SIGNIFICANT_EFFECTS_ON_SPECIAL_AREA.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
