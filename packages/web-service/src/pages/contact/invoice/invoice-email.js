import { contactURIs } from '../../../uris.js'
import { getEmailAddressData, setEmailAddressData } from '../common/email-address/email-address.js'
import { emailAddressPage } from '../common/email-address/email-address-page.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { APIRequests } from '../../../services/api-requests.js'

const { EMAIL, RESPONSIBLE } = contactURIs.INVOICE_PAYER

const emailAddressCompletion = (contactRole, accountRole, urlBase) => async request => {
  // If an address is already present then go to the check page, otherwise go to the postcode page
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  if (account) {
    if (account.address) {
      const applicationData = await APIRequests.APPLICATION.getById(applicationId)
      if (!applicationData.referenceOrPurchaseOrderNumber) {
        return contactURIs.INVOICE_PAYER.PURCHASE_ORDER.uri
      } else {
        return urlBase.CHECK_ANSWERS.uri
      }
    } else {
      return urlBase.POSTCODE.uri
    }
  } else {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    if (contact.address) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      return urlBase.POSTCODE.uri
    }
  }
}

export const invoiceEmail = emailAddressPage({
  page: EMAIL.page,
  uri: EMAIL.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.PAYER, RESPONSIBLE)],
  completion: emailAddressCompletion(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  getData: getEmailAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION),
  setData: setEmailAddressData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION)
}, ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION)
