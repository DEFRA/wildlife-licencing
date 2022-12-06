import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { getPostcodeData, postcodeCompletion, setPostcodeData } from '../common/postcode/postcode.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { POSTCODE, USER } = contactURIs.APPLICANT

export const applicantPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: [checkApplication, checkHasContact(ContactRoles.APPLICANT, USER)],
  getData: getPostcodeData(ContactRoles.APPLICANT, AccountRoles.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  setData: setPostcodeData(ContactRoles.APPLICANT),
  completion: postcodeCompletion(contactURIs.APPLICANT)
})
