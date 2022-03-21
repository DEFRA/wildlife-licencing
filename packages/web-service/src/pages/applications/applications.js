import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'

const getData = async request => {
  // const cache = await request.cache().get()
  await request.cache().set('jkhdgkjshgdf')
  return []
}

const setData = async request => {
  await request.cache().set('ss')
}

export default pageRoute(APPLICATIONS.page, APPLICATIONS.uri, null, '', getData, setData)
