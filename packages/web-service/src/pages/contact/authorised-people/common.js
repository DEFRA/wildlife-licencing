import { checkHasApplication, ContactRoles } from '../common/common.js'
import { contactURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
const { NAME, EMAIL, POSTCODE, ADD } = contactURIs.AUTHORISED_PEOPLE

export const checkAuthorisedPeopleData = async (request, h) => {
  const ck = await checkHasApplication(request, h)
  if (ck) {
    return ck
  }

  const journeyData = await request.cache().getData()
  const contacts = await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON)
    .getByApplicationId(journeyData.applicationId)

  if (contacts.length && !journeyData?.authorisedPeople?.contactId) {
    return h.redirect(TASKLIST.uri)
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

  const returnAndClear = async p => {
    await request.cache().clearPageData(p.page)
    return p.uri
  }

  if (!contact.fullName) {
    return returnAndClear(NAME)
  }

  if (!contact?.contactDetails?.email) {
    return returnAndClear(EMAIL)
  }

  if (contact?.address?.uprn || contact?.address?.addressLine1) {
    return returnAndClear(ADD)
  }

  return returnAndClear(POSTCODE)
}
