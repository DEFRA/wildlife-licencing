import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.ACTIVE.uri

export default pageRoute({ page: habitatURIs.TYPES.page, uri: habitatURIs.TYPES.uri, completion })
