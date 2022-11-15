import { yesNoPage } from '../../common/yes-no.js'
import { checkHasApplication, getExistingContactCandidates } from '../common/common.js'
import { contactURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

const isSignedInUserEcologist = async request => {
  const { userId, applicationId } = await request.cache().getData()
  const applicant = await APIRequests.CONTACT.role(ContactRoles.ECOLOGIST).getByApplicationId(applicationId)
  return applicant?.userId === userId
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.ADDITIONAL_CONTACTS)
  return { isSignedInUserEcologist: await isSignedInUserEcologist(request) }
}

const addAdditionalEcologistCompletion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload['yes-no'] === 'yes') {
    if (await isSignedInUserEcologist(request)) {
      const { userId, applicationId } = await request.cache().getData()
      const contacts = await getExistingContactCandidates(userId, applicationId, ContactRoles.ADDITIONAL_ECOLOGIST,
        [ContactRoles.ECOLOGIST], false)
      if (contacts.length < 1) {
        return contactURIs.ADDITIONAL_ECOLOGIST.NAME.uri
      } else {
        return contactURIs.ADDITIONAL_ECOLOGIST.NAMES.uri
      }
    } else {
      return contactURIs.ADDITIONAL_ECOLOGIST.USER.uri
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
