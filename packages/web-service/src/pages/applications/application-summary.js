import pageRoute from '../../routes/page-route.js'
import { APPLICATION_SUMMARY } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'
import { ContactRoles } from '../contact/common/contact-roles.js'
import { addressLine } from '../service/address.js'
import { applicationStatuses, checkData, getApplicationData } from './application-common-functions.js'

export const getData = async request => {
  // Application summary passes nocache=true to the API to ensure the latest data is always returned
  const { application, applicationType, applicationId } = await getApplicationData(request, true)
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  const siteAddress = sites.length > 0 ? addressLine(sites[0]) : ''
  Object.assign(application, { applicationType, siteAddress })
  Object.assign(application, { userSubmission: timestampFormatter(application?.userSubmission) })
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(application.id)

  return { application, applicant, applicationStatuses }
}

export default pageRoute({
  page: APPLICATION_SUMMARY.page,
  uri: APPLICATION_SUMMARY.uri,
  checkData,
  getData
})
