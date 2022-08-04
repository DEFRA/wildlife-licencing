import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

const completion = async payload => {
  return habitatURIs.TYPES.uri
}

export default pageRoute({ page: habitatURIs.START.page, uri: habitatURIs.START.uri, completion })
