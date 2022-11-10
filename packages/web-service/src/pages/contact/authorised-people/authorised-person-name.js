import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkHasApplication, contactOperationsForContact } from '../common/common.js'
import { getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
import { ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
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

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.IN_PROGRESS })
  return getAuthorisedPeopleData(c => c)
}

export const authorisedPersonName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData: checkHasApplication,
  getData,
  setData: setData,
  completion: getAuthorisedPeopleCompletion
}, ContactRoles.AUTHORISED_PERSON)
