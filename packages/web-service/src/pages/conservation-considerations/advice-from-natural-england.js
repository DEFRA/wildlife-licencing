import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'

const { NE_ADVICE } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.NE_ADVICE.uri
}

export const adviceFromNaturalEngland = yesNoPage({
  page: NE_ADVICE.page,
  uri: NE_ADVICE.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
