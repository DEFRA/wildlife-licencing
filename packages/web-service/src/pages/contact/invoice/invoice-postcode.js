import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { getPostcodeData, postcodeCompletion, setPostcodeData } from '../common/postcode/postcode.js'
import { checkHasContact } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { POSTCODE } = contactURIs.INVOICE_PAYER

export const invoicePostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: checkHasContact(ContactRoles.PAYER, contactURIs.INVOICE_PAYER),
  getData: getPostcodeData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  setData: setPostcodeData(ContactRoles.PAYER),
  completion: postcodeCompletion(contactURIs.INVOICE_PAYER)
})
