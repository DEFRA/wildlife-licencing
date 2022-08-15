import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const completion = async _request => habitatURIs.ACTIVITIES.uri

export default pageRoute({
  page: habitatURIs.WORK_END.page,
  uri: habitatURIs.WORK_END.uri,
  completion
})
