import { ReturnsURIs } from '../../../uris.js'
import { isYes, yesNoPage } from '../../common/yes-no.js'
import { checkApplication } from '../../common/check-application.js'

const { ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE } = ReturnsURIs.A24

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.uri
}

export const artificialSettCreatedBeforeClosure = yesNoPage({
  page: ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.page,
  uri: ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
