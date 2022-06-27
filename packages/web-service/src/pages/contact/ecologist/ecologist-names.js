import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { contactNamesCheckData, getContactNamesData, setContactNamesData, contactNamesCompletion } from '../common/contact-names/contact-names.js'

export const ecologistNamesCheckData = contactNamesCheckData('ECOLOGIST')
export const getEcologistNamesData = getContactNamesData('ECOLOGIST')
export const setEcologistNamesData = setContactNamesData('ECOLOGIST')
export const ecologistNamesCompletion = contactNamesCompletion('ECOLOGIST')

export const ecologistNames = contactNamesPage(contactURIs.ECOLOGIST.NAMES,
  ecologistNamesCheckData, getEcologistNamesData, ecologistNamesCompletion, setEcologistNamesData)
