import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import pageRoute from '../../routes/page-route.js'
import { timestampFormatter } from '../common/common.js'
import { APIRequests } from '../../services/api-requests.js'
import { TASKLIST, APPLICATIONS, APPLICATION_SUMMARY } from '../../uris.js'

// Values to keys and keys to values
const statuses = Object.entries(PowerPlatformKeys.BACKEND_STATUS)
  .map(([k, v]) => ({ [v]: k }))
  .reduce((p, c) => ({ ...p, ...c }))

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  const applications = await APIRequests.APPLICATION.findByUser(userId)
  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
  return {
    applications: applications
      .map(a => ({
        ...a,
        lastSaved: timestampFormatter(a.updatedAt),
        submitted: timestampFormatter(a?.submitted)
      })),
    statuses,
    url: {
      TASKLIST: TASKLIST.uri,
      APPLICATION_SUMMARY: APPLICATION_SUMMARY.uri
    }
  }
}

export default pageRoute({ page: APPLICATIONS.page, uri: APPLICATIONS.uri, getData })
