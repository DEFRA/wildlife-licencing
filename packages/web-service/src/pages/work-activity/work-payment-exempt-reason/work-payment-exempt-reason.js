import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { checkApplication } from '../../common/check-application.js'

const exemptDetails = 'exempt-details'
const exemptReason = 'work-payment-exempt-reason'

const {
  PAYMENT_EXEMPT_REASON: {
    PRESERVING_PUBLIC_HEALTH_AND_SAFETY,
    PREVENT_DAMAGE_TO_LIVESTOCK_CROPS_TIMBER_OR_PROPERTY,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    SCIENTIFIC_RESEARCH_OR_EDUCATION,
    CONSERVATION_OF_PROTECTED_SPECIES,
    CONSERVATION_OF_A_MONUMENT_OR_BUILDING,
    OTHER
  }
} = PowerPlatformKeys

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const payload = pageData?.payload || {}

  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  let paymentExemptReasonExplanation = ''
  if (pageData?.payload[exemptDetails]) {
    paymentExemptReasonExplanation = pageData.payload[exemptDetails]
  } else if (applicationData?.paymentExemptReasonExplanation) {
    paymentExemptReasonExplanation = applicationData.paymentExemptReasonExplanation
  }

  return {
    radioChecked: +(payload[exemptReason]) || applicationData?.paymentExemptReason,
    paymentExemptReasonExplanation,
    PRESERVING_PUBLIC_HEALTH_AND_SAFETY,
    PREVENT_DAMAGE_TO_LIVESTOCK_CROPS_TIMBER_OR_PROPERTY,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    SCIENTIFIC_RESEARCH_OR_EDUCATION,
    CONSERVATION_OF_PROTECTED_SPECIES,
    CONSERVATION_OF_A_MONUMENT_OR_BUILDING,
    OTHER
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  let newData = {}
  if (parseInt(request.payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page]) === OTHER) {
    newData = Object.assign(
      applicationData,
      {
        paymentExemptReason: parseInt(request.payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page]),
        paymentExemptReasonExplanation: request.payload[exemptDetails]
      })
  } else {
    newData = Object.assign(
      applicationData,
      {
        paymentExemptReason: parseInt(request.payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page])
      })

    // If you've changed an answer, we want to ensure we don't retain the
    // `paymentExemptReasonExplanation` from a past answer
    delete newData.paymentExemptReasonExplanation
  }

  await APIRequests.APPLICATION.update(applicationId, newData)
}

export const validator = async payload => {
  if (!payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page]) {
    Joi.assert(payload, Joi.object({
      [exemptReason]: Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if ((parseInt(payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page])) === OTHER) {
    Joi.assert(payload, Joi.object({
      // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
      // Which leads to a mismatch on the character count as
      // '\r\n'.length == 2
      // '\n'.length   == 1
      [exemptDetails]: Joi.string().required().trim().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export default pageRoute({
  uri: workActivityURIs.PAYMENT_EXEMPT_REASON.uri,
  page: workActivityURIs.PAYMENT_EXEMPT_REASON.page,
  completion: workActivityURIs.WORK_CATEGORY.uri,
  checkData: checkApplication,
  getData,
  validator,
  setData
})
