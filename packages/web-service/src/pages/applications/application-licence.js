import pageRoute from '../../routes/page-route.js'
import { APPLICATION_LICENCE, TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'
import { ContactRoles } from '../contact/common/contact-roles.js'
import { addressLine } from '../service/address.js'
import Joi from 'joi'
import { getApplicationData, statuses, checkData, findLastSentEvent } from './application-common-functions.js'

export const getData = async request => {
  const { application, applicationType, applicationId } = await getApplicationData(request)
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  const siteAddress = sites.length ? addressLine(sites[0]) : ''
  Object.assign(application, { applicationType, siteAddress })
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(application.id)
  const licences = await APIRequests.LICENCES.findByApplicationId(application.id)
  licences.forEach(licence => {
    Object.assign(licence, { lastSent: timestampFormatter(findLastSentEvent(licence)?.modifiedOn) })
    Object.assign(licence, { startDate: timestampFormatter(licence.startDate) })
    Object.assign(licence, { endDate: timestampFormatter(licence.endDate) })
  })
  return {
    application,
    applicant,
    statuses,
    licences,
    lastSentEventFlag: licences.length ? findLastSentEvent(licences[0]) : null
  }
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const pageData = request.payload['email-or-return']
  // when a return journey is created we have to visit this section to redirect the user to a return journey
  if (pageData === 'email') {
    await APIRequests.LICENCES.queueTheLicenceEmailResend(applicationId)
  }

  return TASKLIST.uri
}

export default pageRoute({
  page: APPLICATION_LICENCE.page,
  uri: APPLICATION_LICENCE.uri,
  validator: Joi.object({
    'email-or-return': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  checkData,
  getData
})
