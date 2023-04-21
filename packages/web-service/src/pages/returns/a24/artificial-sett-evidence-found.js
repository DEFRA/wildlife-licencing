import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

const { ARTIFICIAL_SETT_EVIDENCE_FOUND } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ARTIFICIAL_SETT_EVIDENCE_FOUND.uri
}

export default pageRoute({
  page: ARTIFICIAL_SETT_EVIDENCE_FOUND.page,
  uri: ARTIFICIAL_SETT_EVIDENCE_FOUND.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
