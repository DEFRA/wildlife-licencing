import { APIRequests } from '../../../../services/api-requests.js'
import { checkApplication } from '../../../common/check-application.js'
import { ContactRoles } from '../../common/contact-roles.js'
import { contactURIs, TASKLIST } from '../../../../uris.js'
import { checkAnswersPage } from '../../../common/check-answers.js'
import { yesNoFromBool } from '../../../common/common.js'
import { SECTION_TASKS } from '../../../tasklist/general-sections.js'
import { tagStatus } from '../../../../services/status-tags.js'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ADDITIONAL_ECOLOGIST, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const additionalEcologist = await APIRequests.CONTACT.role(ContactRoles.ADDITIONAL_ECOLOGIST).getByApplicationId(applicationId)
  await request.cache().setData(journeyData)

  return {
    ecologist: additionalEcologist
      ? [
          { key: 'addAdditionalEcologist', value: yesNoFromBool(true) },
          { key: 'ecologistName', value: additionalEcologist.fullName },
          { key: 'ecologistEmail', value: additionalEcologist.contactDetails.email }
        ].filter(a => a)
      : [
          { key: 'addAdditionalEcologist', value: yesNoFromBool(false) }
        ]
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ADDITIONAL_ECOLOGIST, tagState: tagStatus.COMPLETE })
}

export const additionalEcologistCheckAnswers = checkAnswersPage({
  checkData: checkApplication,
  page: contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.CHECK_ANSWERS.uri,
  getData: getData,
  setData: setData,
  completion: TASKLIST.uri
})
