import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData } from '../common/user/user.js'
import { checkCanBeUser } from '../common/common.js'
import { yesNoPage } from '../../common/yes-no.js'
import { ContactRoles } from '../common/contact-roles.js'
import { additionalContactUserCompletion } from './common.js'
const { USER } = contactURIs.ADDITIONAL_ECOLOGIST

export const additionalEcologistUser = yesNoPage({
  page: USER.page,
  uri: USER.uri,
  checkData: checkCanBeUser([ContactRoles.ECOLOGIST], contactURIs.ADDITIONAL_ECOLOGIST),
  getData: getUserData(ContactRoles.ADDITIONAL_ECOLOGIST),
  setData: setUserData(ContactRoles.ADDITIONAL_ECOLOGIST),
  completion: additionalContactUserCompletion(ContactRoles.ADDITIONAL_ECOLOGIST, [ContactRoles.ECOLOGIST],
    contactURIs.ADDITIONAL_ECOLOGIST)
})
