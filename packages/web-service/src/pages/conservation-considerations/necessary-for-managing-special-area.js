import { ConservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'

const { MANAGING_SPECIAL_AREA } = ConservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ConservationConsiderationURIs.MANAGING_SPECIAL_AREA.uri
}

export const necessaryForManagingSpecialArea = yesNoPage({
  page: MANAGING_SPECIAL_AREA.page,
  uri: MANAGING_SPECIAL_AREA.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
