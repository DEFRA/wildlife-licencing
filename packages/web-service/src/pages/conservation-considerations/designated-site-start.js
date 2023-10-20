import pageRoute from '../../routes/page-route.js'
import { conservationConsiderationURIs } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'
import { checkDesignatedSite } from './common.js'

const { DESIGNATED_SITE_START, DESIGNATED_SITE_NAME } = conservationConsiderationURIs

export default pageRoute({
  page: DESIGNATED_SITE_START.page,
  uri: DESIGNATED_SITE_START.uri,
  checkData: [checkApplication, checkDesignatedSite],
  completion: DESIGNATED_SITE_NAME.uri
})
