import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, APPLICATION_LICENCE, EMAIL_CONFIRMATION, ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'
import { ContactRoles } from '../contact/common/contact-roles.js'
import { addressLine } from '../service/address.js'
import { cacheDirect } from '../../session-cache/cache-decorator.js'
import Joi from 'joi'
import { getApplicationData, statuses, checkData, findLastSentEvent } from './application-common-functions.js'

export const getData = async request => {
  const { application, applicationType, applicationId, licences } = await getApplicationData(request, true)
  const sites = await APIRequests.SITE.findByApplicationId(applicationId)
  const siteAddress = sites.length > 0 ? addressLine(sites[0]) : ''
  Object.assign(application, { applicationType, siteAddress })
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(application.id)

  licences.forEach(licence => {
    Object.assign(licence, { lastSent: timestampFormatter(findLastSentEvent(licence)?.modifiedOn) })
    Object.assign(licence, { startDate: timestampFormatter(licence.startDate) })
    Object.assign(licence, { endDate: timestampFormatter(licence.endDate) })
  })

  const lastSentEventFlag = licences.length > 0 && !!findLastSentEvent(licences[0])

  // Needed in the validator
  const journeyData = await request.cache().getData()
  journeyData.lastSentEventFlag = lastSentEventFlag
  await request.cache().setData(journeyData)

  return {
    application,
    applicant,
    statuses,
    licences,
    lastSentEventFlag
  }
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const pageData = request.payload['email-or-return']
  delete journeyData.returns

  if (pageData === 'email') {
    await APIRequests.LICENCES.queueTheLicenceEmailResend(journeyData?.applicationId)
    return EMAIL_CONFIRMATION.uri
  }

  if (pageData === 'return') {
    const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
    journeyData.licenceId = licences[0].id
    journeyData.licenceNumber = licences[0].licenceNumber
    await request.cache().setData(journeyData)
    return ReturnsURIs.NIL_RETURN.uri
  }

  return APPLICATIONS.uri
}

export const validator = async (payload, context) => {
  const { lastSentEventFlag } = await cacheDirect(context).getData()
  if (lastSentEventFlag) {
    Joi.assert(
      payload,
      Joi.object({
        'email-or-return': Joi.any().required()
      }).options({ abortEarly: false, allowUnknown: true })
    )
  }
}

export default pageRoute({
  page: APPLICATION_LICENCE.page,
  uri: APPLICATION_LICENCE.uri,
  validator,
  completion,
  checkData,
  getData
})
