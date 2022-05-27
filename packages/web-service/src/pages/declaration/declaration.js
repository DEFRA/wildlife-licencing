import pageRoute from '../../routes/page-route.js'
import { DECLARATION, SUBMISSION } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.submit(applicationId)
}

export default pageRoute(DECLARATION.page, DECLARATION.uri, setData, null, null, SUBMISSION.uri, setData)
