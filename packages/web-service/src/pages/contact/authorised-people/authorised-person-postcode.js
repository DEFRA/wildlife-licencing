import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleData } from './common.js'
import { addressLookupForPostcode, postcodeCompletion } from '../common/postcode/postcode.js'

const { POSTCODE, ADDRESS_FORM } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const postcode = request.payload.postcode
  await addressLookupForPostcode(postcode, journeyData, request)
}

export const authorisedPersonPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: checkAuthorisedPeopleData,
  getData: getAuthorisedPeopleData(c => ({
    contactName: c.fullName,
    postcode: c?.address?.postcode,
    uri: { addressForm: `${ADDRESS_FORM.uri}?no-postcode=true` }
  })),
  setData: setData,
  completion: postcodeCompletion(contactURIs.AUTHORISED_PEOPLE)
})
