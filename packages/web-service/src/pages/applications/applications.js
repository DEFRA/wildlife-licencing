import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'

const getData = async request => {
  // const cache = await request.cache().get()
  await request.cache().setPageData('jkhdgkjshgdf')
  return []
}

const setData = async request => {
  await request.cache().setPageData('ss')
}

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
