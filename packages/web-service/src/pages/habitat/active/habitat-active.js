import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.REOPEN.uri

export default pageRoute({ page: habitatURIs.ACTIVE.page, uri: habitatURIs.ACTIVE.uri, completion })
