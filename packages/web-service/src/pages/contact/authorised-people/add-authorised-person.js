import { contactURIs, TASKLIST } from '../../../uris.js'

import { yesNoPage } from '../../common/yes-no.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { addressLine } from '../../service/address.js'
import { checkApplication } from '../../common/check-application.js'
const { ADD, NAME, POSTCODE, EMAIL, REMOVE } = contactURIs.AUTHORISED_PEOPLE

export const checkData = async (request, h) => {
  const ck = await checkApplication(request, h)
  if (ck) {
    return ck
  }

  const journeyData = await request.cache().getData()
  const contacts = await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON)
    .getByApplicationId(journeyData.applicationId)

  const returnAndClear = async p => {
    await request.cache().clearPageData(p.page)
    return h.redirect(p.uri)
  }

  // Check any that are incomplete because of back-button actions
  for (const contact of contacts) {
    if (!contact.fullName) {
      Object.assign(journeyData, { authorisedPeople: { contactId: contact.id } })
      await request.cache().setData(journeyData)
      return returnAndClear(NAME)
    }

    if (!contact?.contactDetails?.email) {
      Object.assign(journeyData, { authorisedPeople: { contactId: contact.id } })
      await request.cache().setData(journeyData)
      return returnAndClear(EMAIL)
    }

    if (!contact?.address) {
      Object.assign(journeyData, { authorisedPeople: { contactId: contact.id } })
      await request.cache().setData(journeyData)
      return returnAndClear(POSTCODE)
    }
  }

  return null
}

export const getData = async request => {
  // Clear any errors
  await request.cache().clearPageData(NAME.page)
  await request.cache().clearPageData(EMAIL.page)
  await request.cache().clearPageData(POSTCODE.page)

  const { applicationId } = await request.cache().getData()
  const contacts = await APIRequests.CONTACT.role(ContactRoles.AUTHORISED_PERSON).getByApplicationId(applicationId)
  const state = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.AUTHORISED_PEOPLE)
  if (state === tagStatus.NOT_STARTED) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.IN_PROGRESS })
  } else if (state === tagStatus.COMPLETE) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  }
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
  const { applicationId } = journeyData
  if (request.payload['yes-no'] === 'yes') {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.IN_PROGRESS })
    await request.cache().clearPageData(NAME.page)
  } else {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.COMPLETE })
  }
  delete journeyData.authorisedPeople
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
