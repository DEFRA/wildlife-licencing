import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { SPECIAL_AREA_START, SPECIAL_AREA_SITE_NAME } = conservationConsiderationURIs

export const getData = async request => {
  return { yesNo: null }
}

// Create a new applicationDesignatedSIte and record the id in the cache
export const setData = async () => {
}

export const completion = async request => {
  return conservationConsiderationURIs.SPECIAL_AREA_START.uri
}

export default pageRoute({
  page: SPECIAL_AREA_START.page,
  uri: SPECIAL_AREA_START.uri,
  checkData: checkApplication,
  getData: getData,
  completion: SPECIAL_AREA_SITE_NAME.uri
})
