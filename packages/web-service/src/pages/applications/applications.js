import pageRoute from '../../routes/page-route.js'
import { timestampFormatter } from '../common/common.js'
import { APIRequests } from '../../services/api-requests.js'
import { APPLICATIONS, SPECIES } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { tagStatus } from '../../services/status-tags.js'
import { applicationStatuses, licenceStatuses } from './application-common-functions.js'

const sorter = (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)

const eligibilityCheckFilter = application => application.submitted || (application.applicationTags &&
  application.applicationTags.find(t => t.tag === SECTION_TASKS.ELIGIBILITY_CHECK && t.tagState === tagStatus.COMPLETE))

export const addSiteName = (userApplicationSites, applicationId) => {
  const [site] = userApplicationSites.filter(uas => uas.applicationId === applicationId).sort(sorter)
  return site
}

export const checkData = async (request, h) => {
  // If the user has no applications redirect to the which-species
  const { userId } = await request.cache().getData()
  const allApplications = await APIRequests.APPLICATION.findByUser(userId)
  if (!allApplications.length) {
    return h.redirect(SPECIES.uri)
  }
  return null
}

const getApplicationLicence = async app => {
  const activeLicences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(app?.id)
  Object.assign(app, { licences: activeLicences })
  return app
}

const getApplicationsWithLicences = async applications => Promise.all(applications.map(application => getApplicationLicence(application)))

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  const allApplications = await APIRequests.APPLICATION.findByUser(userId)
  const userApplicationSites = await APIRequests.SITE.getApplicationSitesByUserId(userId)
  Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())

  const totalSections = Object.keys(SECTION_TASKS).length

  const applications = allApplications.filter(eligibilityCheckFilter).map(a => ({
    ...a,
    lastSaved: timestampFormatter(a.updatedAt),
    submitted: timestampFormatter(a?.userSubmission),
    site: addSiteName(userApplicationSites, a.id),
    completed: a?.applicationTags?.filter(tag => tag.tagState === tagStatus.COMPLETE).length || 0
  })).sort(sorter)

  const applicationsWithLicences = await getApplicationsWithLicences(applications)
  const statuses = {
    ...applicationStatuses,
    ...licenceStatuses
  }

  return {
    totalSections,
    statuses,
    applications: applicationsWithLicences
  }
}

export default pageRoute({
  page: APPLICATIONS.page,
  uri: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData,
  getData
})
