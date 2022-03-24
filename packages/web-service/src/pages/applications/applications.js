import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'

const getData = async _request => []
const setData = async _request => {}

export default pageRoute(
  APPLICATIONS.page,
  APPLICATIONS.uri,
  null, '',
  getData,
  setData,
  {
    auth: {
      mode: 'required'
    }
  }
)
