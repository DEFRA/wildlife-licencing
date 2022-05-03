import { contactURIs } from '../../../uris.js'
import { namePage } from '../common/name-page.js'

const { NAME, IS_ORGANIZATION } = contactURIs.ECOLOGIST

const getData = async request => {}
const setData = async request => {}

export const ecologistName = namePage(NAME, getData, IS_ORGANIZATION, setData)
