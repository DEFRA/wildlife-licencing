import { contactURIs, TASKLIST } from '../../../uris.js'
import { checkHasApplication, contactOperationsForContact, ContactRoles } from '../common/common.js'

import { yesNoPage } from '../../common/yes-no.js'
import { APIRequests } from '../../../services/api-requests.js'
import { addressLine, CONTACT_COMPLETE } from '../common/check-answers/check-answers.js'
const { ADD, NAME, POSTCODE, EMAIL, REMOVE } = contactURIs.AUTHORISED_PEOPLE

export const checkData = async (request, h) => {
  const res = await checkHasApplication(request, h)
  if (res) {
    return res
  }

  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const contacts = await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON)
    .getByApplicationId(journeyData.applicationId)

  // Remove any that are incomplete because of back-button actions
  for (const contact of contacts) {
    if (!contact.fullName || !contact?.contactDetails?.email || !contact?.address) {
      const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON,
        applicationId, userId, contact.id)
      await contactOps.unAssign()
    }
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const contacts = await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON).getByApplicationId(applicationId)
  return {
    contacts: contacts.map(c => ({
      uri: {
        remove: `${REMOVE.uri}?id=${c.id}`,
        name: `${NAME.uri}?id=${c.id}`,
        address: `${POSTCODE.uri}?id=${c.id}`,
        email: `${EMAIL.uri}?id=${c.id}`
      },
      details: [
        { key: 'name', value: c.fullName },
        { key: 'address', value: addressLine(c) },
        { key: 'email', value: c.contactDetails.email }
      ]
    }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  if (request.payload['yes-no'] === 'yes') {
    await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE.AUTHORISED_PERSON)
    const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON, applicationId, userId, null)
    const contact = await contactOps.create(false, request.payload.name)
    Object.assign(journeyData, { authorisedPeople: { contactId: contact.id } })
    await request.cache().clearPageData(NAME.page)
  } else {
    await APIRequests.APPLICATION.tags(applicationId).add(CONTACT_COMPLETE.AUTHORISED_PERSON)
    delete journeyData.authorisedPeople
  }

  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const { payload: { 'yes-no': yesNo } } = await request.cache().getPageData()
  return yesNo === 'yes' ? NAME.uri : TASKLIST.uri
}

export const addAuthorisedPerson = yesNoPage({
  page: ADD.page,
  uri: ADD.uri,
  checkData: checkData,
  getData: getData,
  setData: setData,
  completion: completion
})
