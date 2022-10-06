import { contactAccountOperationsForContactAccount, ContactRoles } from '../common/common.js'
import { addressPage } from '../common/address/address-page.js'
import { contactURIs } from '../../../uris.js'
import { mapLookedUpAddress } from '../common/address/address.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'

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

export const authorisedPersonAddress = addressPage({
  page: ADDRESS.page,
  uri: ADDRESS.uri,
  checkData: checkAuthorisedPeopleData,
  getData: getAuthorisedPeopleData(async (c, r) => {
    const journeyData = await r.cache().getData()
    return {
      contactName: c?.fullName,
      postcode: c?.address?.postcode,
      uri: { addressForm: ADDRESS_FORM.uri, postcode: POSTCODE.uri },
      addressLookup: journeyData.addressLookup
    }
  }),
  setData: setData,
  completion: getAuthorisedPeopleCompletion
})
