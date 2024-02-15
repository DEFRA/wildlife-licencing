import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { contactURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  return { purchaseOrder: applicationData.referenceOrPurchaseOrderNumber || '' }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()

  const pageData = await request.cache().getPageData()
  const referenceOrPurchaseOrderNumber = pageData.payload['purchase-order']

  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  const newData = Object.assign(applicationData, { referenceOrPurchaseOrderNumber })
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export const invoicePurchaseOrder = pageRoute({
  page: contactURIs.INVOICE_PAYER.PURCHASE_ORDER.page,
  uri: contactURIs.INVOICE_PAYER.PURCHASE_ORDER.uri,
  validator: Joi.object({
    'purchase-order': Joi.string().trim().required().max(100)
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion: contactURIs.INVOICE_PAYER.CHECK_ANSWERS.uri,
  getData,
  setData
})
