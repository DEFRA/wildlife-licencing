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

  const params = new URLSearchParams(request.query)
  const id = params.get('id')
  if (id) {
    // Change
    const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON,
      applicationId, userId, id)
    await contactOps.setName(request.payload.name)
    Object.assign(journeyData, { authorisedPeople: { contactId: id } })
  } else {
    // Create
    const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON,
      applicationId, userId, null)
    const contact = await contactOps.create(false, request.payload.name)
    Object.assign(journeyData, { authorisedPeople: { contactId: contact.id } })
  }

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
  setData: setData,
  completion: getAuthorisedPeopleCompletion
}, [ContactRoles.AUTHORISED_PERSON])
