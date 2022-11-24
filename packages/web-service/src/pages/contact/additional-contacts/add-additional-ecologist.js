import { yesNoPage } from '../../common/yes-no.js'
import { checkHasApplication } from '../common/common.js'
import { contactURIs } from '../../../uris.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactCompletion, getAdditionalContactData, setAdditionalContactData } from './common.js'

export const addAdditionalEcologist = yesNoPage({
  page: contactURIs.ADDITIONAL_ECOLOGIST.ADD.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
  checkData: checkHasApplication,
  getData: getAdditionalContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setAdditionalContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: additionalContactCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST)
})
