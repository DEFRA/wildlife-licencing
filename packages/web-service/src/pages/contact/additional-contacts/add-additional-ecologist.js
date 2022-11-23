import { yesNoPage } from '../../common/yes-no.js'
import { canBeUser, checkHasApplication, getExistingContactCandidates } from '../common/common.js'
import { contactURIs } from '../../../uris.js'
import { ContactRoles } from '../common/contact-roles.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.ADDITIONAL_CONTACTS)
  return { isSignedInUserEcologist: !await canBeUser(request, [ContactRoles.ECOLOGIST]) }
}

export const addAdditionalEcologistCompletion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload['yes-no'] === 'yes') {
    if (await canBeUser(request, [ContactRoles.ECOLOGIST])) {
      return contactURIs.ADDITIONAL_ECOLOGIST.USER.uri
    } else {
      const { userId, applicationId } = await request.cache().getData()
      const contacts = await getExistingContactCandidates(userId, applicationId, ContactRoles.ADDITIONAL_ECOLOGIST,
        [ContactRoles.ECOLOGIST], false)
      if (contacts.length < 1) {
        return contactURIs.ADDITIONAL_ECOLOGIST.NAME.uri
      } else {
        return contactURIs.ADDITIONAL_ECOLOGIST.NAMES.uri
      }
    }
  }

  return contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri
}

export const addAdditionalEcologist = yesNoPage({
  page: contactURIs.ADDITIONAL_ECOLOGIST.ADD.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
  checkData: checkHasApplication,
  completion: addAdditionalEcologistCompletion
})
