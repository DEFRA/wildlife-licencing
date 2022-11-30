import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { getPostcodeData, postcodeCompletion, setPostcodeData } from '../common/postcode/postcode.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasApplication, checkHasContact } from '../common/common-handler.js'

const { POSTCODE, USER } = contactURIs.ECOLOGIST

export const ecologistPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: [checkHasApplication, checkHasContact(ContactRoles.ECOLOGIST, USER)],
  getData: getPostcodeData(ContactRoles.ECOLOGIST, AccountRoles.ECOLOGIST_ORGANISATION, contactURIs.ECOLOGIST),
  setData: setPostcodeData(ContactRoles.ECOLOGIST),
  completion: postcodeCompletion(contactURIs.ECOLOGIST)
})
