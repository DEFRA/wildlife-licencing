import { yesNoPage } from '../../common/yes-no.js'
import { contactURIs } from '../../../uris.js'
import { checkAuthorisedPeopleData, getAuthorisedPeopleData } from './common.js'
import { ContactRoles } from '../../../services/api-requests.js'
import { contactOperationsForContact } from '../common/common.js'

const { ADD, REMOVE } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  if (request.payload['yes-no'] === 'yes') {
    const contactOps = contactOperationsForContact(ContactRoles.AUTHORISED_PERSON, applicationId,
      userId, journeyData.authorisedPeople.contactId)
    await contactOps.unAssign()
    delete journeyData.authorisedPeople
    await request.cache().setData(journeyData)
  }
}

export const removeAuthorisedPerson = yesNoPage({
  page: REMOVE.page,
  uri: REMOVE.uri,
  checkData: checkAuthorisedPeopleData,
  getData: getAuthorisedPeopleData(c => ({
    contactName: c.fullName
  })),
  setData: setData,
  completion: ADD.uri
})
