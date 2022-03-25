import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  const applications = await APIRequests.APPLICATION.findByUser(userId)
  console.log(JSON.stringify(applications))
  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
  return {
    applications: applications
      .map(a => ({
        ...a,
        lastSaved: Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
          .format(new Date(a.updatedAt))
      }))
  }
}

export default pageRoute(
  APPLICATIONS.page,
  APPLICATIONS.uri,
  null,
  null,
  getData
)
