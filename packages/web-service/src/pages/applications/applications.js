import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import pageRoute from '../../routes/page-route.js'
import { timestampFormatter } from '../common/common.js'
import { APIRequests } from '../../services/api-requests.js'
import { countCompleteSections } from '../common/count-complete-sections.js'
import { TASKLIST, APPLICATIONS, APPLICATION_SUMMARY } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'

// Values to keys and keys to values
const statuses = Object.entries(PowerPlatformKeys.BACKEND_STATUS)
  .map(([k, v]) => ({ [v]: k }))
  .reduce((p, c) => ({ ...p, ...c }))

const sortApplications = (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  const allApplications = await APIRequests.APPLICATION.findByUser(userId)
  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())

  const totalSections = Object.keys(SECTION_TASKS).length

  const applications = allApplications.map(a => ({
    ...a,
    lastSaved: timestampFormatter(a.updatedAt),
    submitted: timestampFormatter(a?.submitted)
  })).sort(sortApplications)

  for (let i = 0; i < applications.length; i++) {
    if (applications[i].id) {
      const completedSections = await countCompleteSections(applications[i].id)
      applications[i].statusValue = `${completedSections.length} of ${totalSections} sections completed`
    }
  }

  return {
    statuses,
    applications,
    url: {
      TASKLIST: TASKLIST.uri,
      APPLICATION_SUMMARY: APPLICATION_SUMMARY.uri
    }
  }
}

export default pageRoute({
  page: APPLICATIONS.page,
  uri: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  getData
})
