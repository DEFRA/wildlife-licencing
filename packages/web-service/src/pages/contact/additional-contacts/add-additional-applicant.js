import { yesNoPage } from '../../common/yes-no.js'
import { canBeUser, checkHasApplication, getExistingContactCandidates } from '../common/common.js'
import { contactURIs } from '../../../uris.js'
import { ContactRoles } from '../common/contact-roles.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.ADDITIONAL_CONTACTS)
  return { isSignedInUserApplicant: !await canBeUser(request, [ContactRoles.APPLICANT]) }
}

export const addAdditionalApplicantCompletion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload['yes-no'] === 'yes') {
    if (await canBeUser(request, [ContactRoles.APPLICANT])) {
      return contactURIs.ADDITIONAL_APPLICANT.USER.uri
    } else {
      const { userId, applicationId } = await request.cache().getData()
      const contacts = await getExistingContactCandidates(userId, applicationId, ContactRoles.ADDITIONAL_APPLICANT,
        [ContactRoles.APPLICANT], false)
      if (contacts.length < 1) {
        return contactURIs.ADDITIONAL_APPLICANT.NAME.uri
      } else {
        return contactURIs.ADDITIONAL_APPLICANT.NAMES.uri
      }
    }
  }

  return contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri
}

export const addAdditionalApplicant = yesNoPage({
  page: contactURIs.ADDITIONAL_APPLICANT.ADD.page,
  uri: contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
  getData: getData,
  checkData: checkHasApplication,
  completion: addAdditionalApplicantCompletion
})
