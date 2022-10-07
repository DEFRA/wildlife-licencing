import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkHasApplication, contactOperationsForContact, ContactRoles } from '../common/common.js'
import { getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
const { NAME } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON,
    applicationId, userId, null)
  const contact = await contactOps.create(false, request.payload.name)
  Object.assign(journeyData, { authorisedPeople: { contactId: contact.id } })
  await request.cache().setData(journeyData)
}

export const authorisedPersonName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasApplication,
  getData: getAuthorisedPeopleData(c => c),
  setData: setData,
  completion: getAuthorisedPeopleCompletion
}, ContactRoles.AUTHORISED_PERSON)
