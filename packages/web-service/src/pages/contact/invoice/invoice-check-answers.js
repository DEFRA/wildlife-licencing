import { contactURIs, TASKLIST } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { APIRequests } from '../../../services/api-requests.js'
import { yesNoFromBool } from '../../common/common.js'
import { addressLine } from '../../service/address.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { tagStatus } from '../../../services/status-tags.js'
import { generateOutput } from './common.js'

const { CHECK_ANSWERS, RESPONSIBLE, PURCHASE_ORDER } = contactURIs.INVOICE_PAYER

export const checkHasPurchaseOrderNumber = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  if (!applicationData.referenceOrPurchaseOrderNumber) {
    return h.redirect(PURCHASE_ORDER.uri)
  }
  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const responsibility = await generateOutput(request)

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return {
    responsibility,
    checkYourAnswers: [
      { key: 'whoIsResponsible', value: responsibility.name },
      { key: 'email', value: responsibility.account?.contactDetails?.email || responsibility.contact?.contactDetails?.email },
      (responsibility.responsible === 'other' &&
        { key: 'contactIsOrganisation', value: yesNoFromBool(!!responsibility.account) }),
      (responsibility.account && { key: 'contactOrganisations', value: responsibility.account.name }),
      { key: 'address', value: addressLine(responsibility.account || responsibility.contact) },
      { key: 'purchaseOrderRef', value: applicationData.referenceOrPurchaseOrderNumber }
    ].filter(a => a)
  }
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export const invoiceCheckAnswers = checkAnswersPage({
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.PAYER, RESPONSIBLE),
    checkAccountComplete(AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER),
    checkHasPurchaseOrderNumber
  ],
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData,
  completion
})
