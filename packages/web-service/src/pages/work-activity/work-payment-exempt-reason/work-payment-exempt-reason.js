import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { checkApplication } from '../../common/check-application.js'

const {
  APPLICATION_CATEGORY: {
    REGISTERED_PLACES_OF_WORSHIP,
    SCHEDULED_MONUMENTS,
    LISTED_BUILDINGS,
    TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    OTHER
  }
} = PowerPlatformKeys

export const getData = async _request => {
  return {
    REGISTERED_PLACES_OF_WORSHIP,
    SCHEDULED_MONUMENTS,
    LISTED_BUILDINGS,
    TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
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
        applicationCategory: parseInt(request.payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page]),
        paymentExemptReason: request.payload['exempt-details']
      })
  } else {
    newData = Object.assign(
      applicationData,
      {
        applicationCategory: parseInt(request.payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page])
      })

    // If you've changed an answer, we want to ensure we don't retain the
    // `paymentExemptReason` from a past answer
    delete newData.paymentExemptReason
  }

  await APIRequests.APPLICATION.update(applicationId, newData)
}

export const validator = async payload => {
  if (!payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page]) {
    Joi.assert(payload, Joi.object({
      'work-payment-exempt-reason': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if ((parseInt(payload[workActivityURIs.PAYMENT_EXEMPT_REASON.page])) === OTHER) {
    Joi.assert(payload, Joi.object({
      // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
      // Which leads to a mismatch on the character count as
      // '\r\n'.length == 2
      // '\n'.length   == 1
      'exempt-details': Joi.string().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export default pageRoute({
  uri: workActivityURIs.PAYMENT_EXEMPT_REASON.uri,
  page: workActivityURIs.PAYMENT_EXEMPT_REASON.page,
  completion: workActivityURIs.CHECK_YOUR_ANSWERS.uri,
  checkData: checkApplication,
  getData,
  validator,
  setData
})
