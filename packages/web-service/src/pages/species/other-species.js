import pageRoute from '../../routes/page-route.js'
import { OTHER_SPECIES } from '../../uris.js'

export default pageRoute({
  page: OTHER_SPECIES.page,
  uri: OTHER_SPECIES.uri,
  options: { auth: { mode: 'optional' } }
})
