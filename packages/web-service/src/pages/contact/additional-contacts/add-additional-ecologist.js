import { yesNoPage } from '../../common/yes-no.js'
import { contactURIs } from '../../../uris.js'
import { ContactRoles } from '../common/contact-roles.js'
import { addAdditionalContactCompletion, getAdditionalContactData, setAdditionalContactData } from './common.js'
import { checkHasApplication } from '../common/common-handler.js'

export const addAdditionalEcologist = yesNoPage({
  page: contactURIs.ADDITIONAL_ECOLOGIST.ADD.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
  checkData: checkHasApplication,
  getData: getAdditionalContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setAdditionalContactData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: addAdditionalContactCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, contactURIs.ADDITIONAL_ECOLOGIST)
})
