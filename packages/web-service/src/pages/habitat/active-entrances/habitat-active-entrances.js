import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.GRID_REF.uri

export default pageRoute({ page: habitatURIs.ACTIVE_ENTRANCES.page, uri: habitatURIs.ACTIVE_ENTRANCES.uri, completion })
