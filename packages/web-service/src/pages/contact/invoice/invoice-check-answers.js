import { contactURIs, TASKLIST } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { canBeUser, checkHasApplication } from '../common/common.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { yesNoFromBool } from '../../common/common.js'
import { addressLine } from '../../service/address.js'
const { CHECK_ANSWERS } = contactURIs.INVOICE_PAYER

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const payer = await APIRequests.CONTACT.role(ContactRoles.PAYER).getByApplicationId(applicationId)
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(applicationId)
  const ecologist = await APIRequests.CONTACT.role(ContactRoles.ECOLOGIST).getByApplicationId(applicationId)

  const responsibility = await (async p => {
    if (p.id === applicant.id) {
      const account = await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).getByApplicationId(applicationId)
      return { responsible: 'applicant', name: applicant.fullName, contact: applicant, account }
    } else if (p.id === ecologist.id) {
      const account = await APIRequests.ACCOUNT.role(AccountRoles.ECOLOGIST_ORGANISATION).getByApplicationId(applicationId)
      return { responsible: 'ecologist', name: ecologist.fullName, contact: ecologist, account }
    } else {
      const account = await APIRequests.ACCOUNT.role(AccountRoles.PAYER_ORGANISATION).getByApplicationId(applicationId)
      return { responsible: 'other', name: p.fullName, contact: payer, account }
    }
  })(payer)
  // (await canBeUser(request, [contactRole]) && {
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const res = {
    responsibility,
    checkYourAnswers: [
      { key: 'whoIsResponsible', value: responsibility.name },
      (responsibility.responsible === 'other' &&
        await canBeUser(request, [ContactRoles.APPLICANT, ContactRoles.ECOLOGIST]) &&
        { key: 'contactIsUser', value: yesNoFromBool(!!responsibility.contact.userId) }),
      (responsibility.responsible === 'other' &&
        await canBeUser(request, [ContactRoles.APPLICANT, ContactRoles.ECOLOGIST]) &&
        { key: 'contactIsOrganisation', value: yesNoFromBool(!!responsibility.account) }),
      (responsibility.account && { key: 'contactOrganisations', value: responsibility.account.name }),
      { key: 'address', value: addressLine(responsibility.account || responsibility.contact) },
      { key: 'email', value: responsibility.account?.contactDetails?.email || responsibility.contact?.contactDetails?.email }
    ].filter(a => a)
  }
  console.log(JSON.stringify(res, null, 4))
  return res
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export const invoiceCheckAnswers = checkAnswersPage({
  checkData: checkHasApplication,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData,
  completion
})
