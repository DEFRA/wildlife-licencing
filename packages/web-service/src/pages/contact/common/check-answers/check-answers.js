import { APIRequests } from '../../../../services/api-requests.js'
import { yesNoFromBool } from '../../../common/common.js'
import { addressLine } from '../../../service/address.js'
import { tagStatus } from '../../../../services/status-tags.js'
import { ROLE_SECTION_MAP } from '../common-handler.js'

export const getCheckAnswersData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: ROLE_SECTION_MAP[contactRole], tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  // The check-answers macro requires an array of k, v pair objects
  return {
    hasAccount: !!account,
    checkYourAnswers: [
      { key: 'whoIsTheLicenceFor', value: contact.fullName },
      { key: 'contactIsOrganisation', value: yesNoFromBool(!!account) },
      (account && { key: 'contactOrganisations', value: account.name }),
      { key: 'address', value: addressLine(account || contact) },
      { key: 'email', value: account?.contactDetails?.email || contact?.contactDetails?.email }
    ].filter(a => a) // Remove null values
  }
}

export const setCheckAnswersCompletion = contactRole => async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: ROLE_SECTION_MAP[contactRole], tagState: tagStatus.COMPLETE })
}
