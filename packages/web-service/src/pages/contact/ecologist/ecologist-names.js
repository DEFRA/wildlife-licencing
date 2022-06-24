import { contactURIs } from '../../../uris.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { contactNamesCheckData, getContactNamesData, setContactNamesData, contactNamesCompletion } from '../common/contact-names/contact-names.js'

const ecologistNamesCheckData = contactNamesCheckData('ECOLOGIST')
const getEcologistNamesData = getContactNamesData('ECOLOGIST')
const setEcologistNamesData = setContactNamesData('ECOLOGIST')
const ecologistNamesCompletion = contactNamesCompletion('ECOLOGIST')

export const ecologistNames = contactNamesPage(contactURIs.ECOLOGIST.NAMES,
  ecologistNamesCheckData, getEcologistNamesData, ecologistNamesCompletion, setEcologistNamesData)
