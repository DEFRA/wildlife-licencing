import { APIRequests } from '../../../../services/api-requests.js'
import { checkData } from '../common.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { contactURIs, TASKLIST } from '../../../../uris.js'

export const contactNamesCheckData = c => async (request, h) => {
  const { NAME } = contactURIs[c]
  const cd = await checkData(request, h)
  if (cd) {
    return cd
  }

  const { userId } = await request.cache().getData()
  const contacts = await APIRequests[c].findByUser(userId, DEFAULT_ROLE)
  if (!contacts.length) {
    return h.redirect(NAME.uri)
  }

  return null
}

export const getContactNamesData = c => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests[c].getByApplicationId(applicationId)
  const contacts = await APIRequests[c].findByUser(userId, DEFAULT_ROLE)
  return { contact, contacts }
}

export const setContactNamesData = c => async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  if (contact !== 'new') {
    const { applicationId } = await request.cache().getData()
    await APIRequests[c].assign(applicationId, contact)
  }
}

export const contactNamesCompletion = c => async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  let result = TASKLIST.uri
  if (contact === 'new') {
    // At this point un-assign the contact from the application
    const { NAME } = contactURIs[c]
    const { applicationId } = await request.cache().getData()
    await request.cache().clearPageData(NAME.page)
    await APIRequests[c].unAssign(applicationId)
    result = NAME.uri
  }
  return result
}
