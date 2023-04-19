import { APIRequests } from '../../../services/api-requests.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { contactURIs } from '../../../uris.js'

export const generateOutput = async request => {
  const { applicationId } = await request.cache().getData()
  const payer = await APIRequests.CONTACT.role(ContactRoles.PAYER).getByApplicationId(applicationId)
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(applicationId)
  const ecologist = await APIRequests.CONTACT.role(ContactRoles.ECOLOGIST).getByApplicationId(applicationId)

  return (async p => {
    if (p.id === applicant.id) {
      const account = await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).getByApplicationId(applicationId)
      return { responsible: 'applicant', name: applicant.fullName, contact: applicant, account }
    } else if (p.id === ecologist.id) {
      const account = await APIRequests.ACCOUNT.role(AccountRoles.ECOLOGIST_ORGANISATION).getByApplicationId(applicationId)
      return { responsible: 'ecologist', name: ecologist.fullName, contact: ecologist, account }
    } else {
      const account = await APIRequests.ACCOUNT.role(AccountRoles.PAYER_ORGANISATION).getByApplicationId(applicationId)
      return { responsible: 'other', name: p.fullName, contact: payer, account }
    }
  })(payer)
}

export const purchaseOrderCompletion = async request => {
  const { CHECK_ANSWERS, PURCHASE_ORDER } = contactURIs.INVOICE_PAYER

  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  if (!applicationData.referenceOrPurchaseOrderNumber) {
    return PURCHASE_ORDER.uri
  } else {
    return CHECK_ANSWERS.uri
  }
}
