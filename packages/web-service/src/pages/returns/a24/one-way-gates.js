import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'

const { ONE_WAY_GATES } = ReturnsURIs.A24

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ONE_WAY_GATES.uri
}

export const oneWayGates = yesNoConditionalPage({
  page: ONE_WAY_GATES.page,
  uri: ONE_WAY_GATES.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
