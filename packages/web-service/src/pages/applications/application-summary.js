import pageRoute from '../../routes/page-route.js'
import { APPLICATION_SUMMARY, APPLICATIONS } from '../../uris.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { APIRequests } from '../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { timestampFormatter } from '../common/common.js'
import { ContactRoles } from '../contact/common/contact-roles.js'

const { BACKEND_STATUS, APPLICATION_TYPES } = PowerPlatformKeys

export const checkData = async (request, h) => {
  const params = new URLSearchParams(request.query)
  if (!params.get('applicationId')) {
    return h.redirect(APPLICATIONS.uri)
  }

  const applicationId = params.get('applicationId')
  const { userId } = await request.cache().getData()
  const roles = await APIRequests.APPLICATION.findRoles(userId, applicationId)
  if (!roles?.includes(DEFAULT_ROLE)) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

// values to keys and keys to values
export const statuses = Object.entries(BACKEND_STATUS)
  .map(([k, v]) => ({ [v]: k }))
  .reduce((p, c) => ({ ...p, ...c }))

const findApplicationType = application => Object.entries(APPLICATION_TYPES)
  .find(([_k, v]) => v === application.applicationTypeId)[0]

export const findLastSentEvent = licence => (licence.annotations &&
  licence.annotations.filter(a => a.objectTypeCode === 'sdds_license' && a.mimetype === 'application/pdf')
    .sort((a, b) => Date(a.modifiedOn) > Date(b.modifiedOn))[0]) || null

export const getData = async request => {
  const params = new URLSearchParams(request.query)
  const applicationId = params.get('applicationId')
  const journeyData = await request.cache().getData()
  await request.cache().setData(Object.assign(journeyData, { applicationId }))
  const application = await APIRequests.APPLICATION.getById(applicationId)
  const applicationType = findApplicationType(application)
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  const name = sites.length ? sites[0].name : ''
  Object.assign(application, { applicationType, name })
  Object.assign(application, { userSubmission: timestampFormatter(application?.userSubmission) })
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(application.id)
  const licences = await APIRequests.LICENCES.findByApplicationId(application.id)
  licences.forEach(licence => {
    Object.assign(licence, { lastSent: timestampFormatter(findLastSentEvent(licence)?.modifiedOn) })
    Object.assign(licence, { startDate: timestampFormatter(licence.startDate) })
    Object.assign(licence, { endDate: timestampFormatter(licence.endDate) })
  })
  return { application, applicant, statuses, licences }
}

export default pageRoute({
  page: APPLICATION_SUMMARY.page,
  uri: APPLICATION_SUMMARY.uri,
  checkData,
  getData
})
