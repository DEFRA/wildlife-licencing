import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { getPostcodeData, postcodeCompletion, setPostcodeData } from '../common/postcode/postcode.js'
import { checkHasContact } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'

const { POSTCODE } = contactURIs.APPLICANT

export const applicantPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: checkHasContact(ContactRoles.APPLICANT, contactURIs.APPLICANT),
  getData: getPostcodeData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  setData: setPostcodeData(ContactRoles.APPLICANT),
  completion: postcodeCompletion(contactURIs.APPLICANT)
})
