import { ReturnsURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'

const { OUTCOME } = ReturnsURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ReturnsURIs.OUTCOME.uri
}

export const outcome = yesNoPage({
  page: OUTCOME.page,
  uri: OUTCOME.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
