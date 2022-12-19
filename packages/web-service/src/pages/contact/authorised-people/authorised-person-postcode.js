import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleData } from './common.js'
import { addressLookupForPostcode, postcodeCompletion } from '../common/postcode/postcode.js'
import { checkApplication } from '../../common/check-application.js'

const { POSTCODE, ADDRESS_FORM } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const postcode = request.payload.postcode
  await addressLookupForPostcode(postcode, journeyData, request)
}

export const ofContact = contact => ({
  contactName: contact.fullName,
  postcode: contact?.address?.postcode,
  uri: { addressForm: `${ADDRESS_FORM.uri}?no-postcode=true` }
})

export const authorisedPersonPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: [checkApplication, checkAuthorisedPeopleData],
  getData: getAuthorisedPeopleData(ofContact),
  setData: setData,
  completion: postcodeCompletion(contactURIs.AUTHORISED_PEOPLE)
})
