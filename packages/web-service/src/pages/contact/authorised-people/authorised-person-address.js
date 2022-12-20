import { addressPage } from '../common/address/address-page.js'
import { contactURIs } from '../../../uris.js'
import { mapLookedUpAddress } from '../common/address/address.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactAccountOperationsForContactAccount } from '../common/operations.js'
import { checkApplication } from '../../common/check-application.js'

const { ADDRESS, ADDRESS_FORM, POSTCODE } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId, addressLookup } = journeyData
  const { Address: lookupAddress } = addressLookup.find(a => Number.parseInt(a.Address.UPRN) === request.payload.uprn)
  const apiAddress = mapLookedUpAddress(lookupAddress)
  const contactAcctOps = contactAccountOperationsForContactAccount(ContactRoles.AUTHORISED_PERSON, null,
    applicationId, userId, journeyData.authorisedPeople.contactId, null)
  await contactAcctOps.setAddress(apiAddress)
  delete journeyData.addressLookup
  await request.cache().setData(journeyData)
}

// Ensure there is an address
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.addressLookup) {
    return h.redirect(POSTCODE.uri)
  }
  return null
}

export const ofContact = async (contact, request) => {
  const journeyData = await request.cache().getData()
  return {
    contactName: contact?.fullName,
    postcode: contact?.address?.postcode,
    uri: { addressForm: ADDRESS_FORM.uri, postcode: POSTCODE.uri },
    addressLookup: journeyData.addressLookup
  }
}

export const authorisedPersonAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: [checkApplication, checkAuthorisedPeopleData, checkData],
  getData: getAuthorisedPeopleData(ofContact),
  setData: setData,
  completion: getAuthorisedPeopleCompletion
})
