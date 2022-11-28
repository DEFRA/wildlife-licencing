import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { getPostcodeData, postcodeCompletion, setPostcodeData } from '../common/postcode/postcode.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { POSTCODE } = contactURIs.INVOICE_PAYER

export const invoicePostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.PAYER)],
  getData: getPostcodeData(ContactRoles.PAYER, AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
  setData: setPostcodeData(ContactRoles.PAYER),
  completion: postcodeCompletion(contactURIs.INVOICE_PAYER)
})
