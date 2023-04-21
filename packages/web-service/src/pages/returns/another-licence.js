import { ReturnsURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'

const { ANOTHER_LICENCE } = ReturnsURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ReturnsURIs.ANOTHER_LICENCE.uri
}

export const anotherLicence = yesNoPage({
  page: ANOTHER_LICENCE.page,
  uri: ANOTHER_LICENCE.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
