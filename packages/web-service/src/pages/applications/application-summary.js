import pageRoute from '../../routes/page-route.js'
import { APPLICATION_SUMMARY } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'
import { ContactRoles } from '../contact/common/contact-roles.js'
import { addressLine } from '../service/address.js'
import { statuses, checkData, getApplicationData } from './application-common-functions.js'

export const getData = async request => {
  const { application, applicationType, applicationId } = await getApplicationData(request)
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  const siteAddress = sites.length ? addressLine(sites[0]) : ''
  Object.assign(application, { applicationType, siteAddress })
  Object.assign(application, { userSubmission: timestampFormatter(application?.userSubmission) })
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(application.id)

  return { application, applicant, statuses }
}

export default pageRoute({
  page: APPLICATION_SUMMARY.page,
  uri: APPLICATION_SUMMARY.uri,
  checkData,
  getData
})
