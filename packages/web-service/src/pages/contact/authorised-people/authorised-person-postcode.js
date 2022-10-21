import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { CONTACT_COMPLETE } from '../common/check-answers/check-answers.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleData } from './common.js'
import { addressLookupForPostcode, postcodeCompletion } from '../common/postcode/postcode.js'

const { POSTCODE, ADDRESS_FORM, ADDRESS } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const postcode = request.payload.postcode
  await request.cache().clearPageData(ADDRESS.page)
  await request.cache().clearPageData(ADDRESS_FORM.page)
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: CONTACT_COMPLETE.AUTHORISED_PERSON, tagState: tagStatus.IN_PROGRESS })
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
