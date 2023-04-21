import { ReturnsURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'

const { COMPLETE_WITHIN_DATES } = ReturnsURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return ReturnsURIs.COMPLETE_WITHIN_DATES.uri
}

export const completeWithinDates = yesNoPage({
  page: COMPLETE_WITHIN_DATES.page,
  uri: COMPLETE_WITHIN_DATES.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
