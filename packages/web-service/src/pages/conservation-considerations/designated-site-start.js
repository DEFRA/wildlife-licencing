import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

const { DESIGNATED_SITE_START, DESIGNATED_SITE_NAME } = conservationConsiderationURIs

export const getData = async request => {
  return { yesNo: null }
}

// Create a new applicationDesignatedSIte and record the id in the cache
export const setData = async () => {
}

export const completion = async request => {
  return conservationConsiderationURIs.DESIGNATED_SITE_START.uri
}

export default pageRoute({
  page: DESIGNATED_SITE_START.page,
  uri: DESIGNATED_SITE_START.uri,
  checkData: checkApplication,
  getData: getData,
  completion: DESIGNATED_SITE_NAME.uri
})
