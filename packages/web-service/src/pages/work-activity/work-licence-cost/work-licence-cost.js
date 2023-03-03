import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'

export default pageRoute({
  uri: workActivityURIs.LICENCE_COST.uri,
  page: workActivityURIs.LICENCE_COST.page,
  completion: workActivityURIs.CHECK_YOUR_ANSWERS.uri
})
