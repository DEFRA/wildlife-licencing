import { contactURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'
import { checkApplication } from '../../common/check-application.js'
const { NAME, EMAIL, POSTCODE, ADD } = contactURIs.AUTHORISED_PEOPLE

export const checkAuthorisedPeopleData = async (request, h) => {
  const ck = await checkApplication(request, h)
  if (ck) {
    return ck
  }
  const journeyData = await request.cache().getData()
  const params = new URLSearchParams(request.query)
  const id = params.get('id')
  if (id) {
    const contact = await APIRequests.CONTACT.getById(id)
    if (!contact) {
      return h.redirect(ADD.uri)
    }
  } else if (journeyData?.authorisedPeople?.contactId) {
    const contact = await APIRequests.CONTACT.getById(journeyData.authorisedPeople.contactId)
    if (!contact) {
      return h.redirect(ADD.uri)
    }
  } else {
    // Journey contact is not set
    const contacts = await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON)
      .getByApplicationId(journeyData.applicationId)

    if (contacts.length) {
      return h.redirect(ADD.uri)
    }
  }

  return null
}

export const getAuthorisedPeopleData = ofContact => async request => {
  const journeyData = await request.cache().getData()
  const params = new URLSearchParams(request.query)
  const id = params.get('id')
  if (id) {
    Object.assign(journeyData, { authorisedPeople: { contactId: id } })
    await request.cache().setData(journeyData)
    const contact = await APIRequests.CONTACT.getById(id)
    return ofContact(contact, request)
  } else if (journeyData?.authorisedPeople?.contactId) {
    const contact = await APIRequests.CONTACT.getById(journeyData.authorisedPeople.contactId)
    return ofContact(contact, request)
  }
  return null
}

export const getAuthorisedPeopleCompletion = async request => {
  const journeyData = await request.cache().getData()
  const contact = await APIRequests.CONTACT.getById(journeyData.authorisedPeople.contactId)

  if (!contact.fullName) {
    return NAME.uri
  }

  if (!contact?.contactDetails?.email) {
    return EMAIL.uri
  }

  if (contact?.address?.uprn || contact?.address?.addressLine1) {
    return ADD.uri
  }

  return POSTCODE.uri
}
