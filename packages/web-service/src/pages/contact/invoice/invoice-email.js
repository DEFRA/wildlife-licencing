import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData, emailAddressCompletion } from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'

const { EMAIL, RESPONSIBLE } = contactURIs.INVOICE_PAYER

export const redirectJourney = async (applicationId, urlBase) => {
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  if (!applicationData.referenceOrPurchaseOrderNumber) {
    return contactURIs.INVOICE_PAYER.PURCHASE_ORDER.uri
  } else {
    return urlBase.CHECK_ANSWERS.uri
  }
}

export const invoiceEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.PAYER, RESPONSIBLE)],
  completion: emailAddressCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER, redirectJourney),
  getData: getEmailAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION)
}, ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION)
