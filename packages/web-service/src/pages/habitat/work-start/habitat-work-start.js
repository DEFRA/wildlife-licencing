import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.WORK_END.uri

export default pageRoute({ page: habitatURIs.WORK_START.page, uri: habitatURIs.WORK_START.uri, completion })
