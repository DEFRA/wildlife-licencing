import { conservationConsiderationURIs } from '../../uris.js'
import { isYes, yesNoPage } from '../common/yes-no.js'
import { checkApplication } from '../common/check-application.js'

const { SPECIAL_AREA_SITE_REMOVE } = conservationConsiderationURIs

export const checkData = async request => {
  return null
}

export const getData = async request => {
  return { yesNo: null }
}

export const setData = async request => {

}

export const completion = async request => {
  return conservationConsiderationURIs.SPECIAL_AREA_SITE_REMOVE.uri
}

export const specialAreaRemove = yesNoPage({
  page: SPECIAL_AREA_SITE_REMOVE.page,
  uri: SPECIAL_AREA_SITE_REMOVE.uri,
  checkData: [checkApplication, checkData],
  getData: getData,
  completion: completion,
  setData: setData
})
