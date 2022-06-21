import { contactURIs, TASKLIST } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { checkData } from '../common/common.js'
import { APIRequests } from '../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../constants.js'

const { NAMES, NAME } = contactURIs.ECOLOGIST

export const ecologistNamesCheckData = async (request, h) => {
  const cd = await checkData(request, h)
  if (cd) {
    return cd
  }

  const { userId } = await request.cache().getData()
  const ecologists = await APIRequests.ECOLOGIST.findByUser(userId, DEFAULT_ROLE)
  if (!ecologists.length) {
    return h.redirect(NAME.uri)
  }

  return null
}

export const getEcologistNamesData = async request => {
  const { userId } = await request.cache().getData()
  const ecologists = await APIRequests.ECOLOGIST.findByUser(userId, DEFAULT_ROLE)
  return [...new Set(ecologists.map(a => a.fullName))]
    .sort((a, b) => a.localeCompare(b.fullName, 'en'))
    .map(e => ({ id: Buffer.from(e).toString('base64'), fullName: e }))
}

export const setEcologistNamesData = async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  if (contact !== 'new') {
    const name = Buffer.from(contact, 'base64').toString('utf8')
    const { userId, applicationId } = await request.cache().getData()
    const ecologist = await APIRequests.ECOLOGIST.getById(userId, applicationId)
    Object.assign(ecologist, { fullName: name })
    await APIRequests.ECOLOGIST.putById(userId, applicationId, ecologist)
  }
}

export const completion = async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  return contact === 'new' ? NAME.uri : TASKLIST.uri
}

export const ecologistNames = contactNamesPage(NAMES, ecologistNamesCheckData, getEcologistNamesData, completion, setEcologistNamesData)
