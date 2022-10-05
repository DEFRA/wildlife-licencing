import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { ContactRoles } from '../../../services/api-requests.js'
import { checkHasApplication, contactOperationsForContact } from '../common/common.js'
import { getAuthorisedPeopleCompletion, getAuthorisedPeopleData } from './common.js'
const { NAME } = contactURIs.AUTHORISED_PEOPLE

const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON,
    applicationId, userId, journeyData.authorisedPeople.contactId)
  await contactOps.setName(request.payload.name)
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
