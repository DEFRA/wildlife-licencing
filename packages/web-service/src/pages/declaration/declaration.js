import pageRoute from '../../routes/page-route.js'
import { DECLARATION } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'

export const setData = async request => {
  const { userId, applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.submit(userId, applicationId)
}

export default pageRoute(DECLARATION.page, DECLARATION.uri, setData, null, null, null, setData)
