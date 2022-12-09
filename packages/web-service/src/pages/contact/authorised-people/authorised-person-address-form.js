import { addressFormPage } from '../common/address-form/address-form-page.js'
import { contactURIs } from '../../../uris.js'
import { mapInputAddress } from '../common/address-form/address-form.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactAccountOperationsForContactAccount } from '../common/operations.js'

const { ADDRESS_FORM } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const inputAddress = request.payload
  const apiAddress = mapInputAddress(inputAddress)
  const contactAcctOps = contactAccountOperationsForContactAccount(ContactRoles.AUTHORISED_PERSON, null,
    applicationId, userId, journeyData.authorisedPeople.contactId, null)
  await contactAcctOps.setAddress(apiAddress)
}

export const authorisedPersonAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: checkAuthorisedPeopleData,
  getData: getAuthorisedPeopleData((c, r) => ({
    contactName: c.fullName,
    postCode: !r.query['no-postcode']
  })),
  setData: setData,
  completion: getAuthorisedPeopleCompletion
})
