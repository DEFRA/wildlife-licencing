import { contactURIs } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { APIRequests } from '../../../services/api-requests.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'
import { addressLine } from '../../service/address.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'

const { CONTACT_DETAILS, RESPONSIBLE } = contactURIs.INVOICE_PAYER

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
  return {
    responsibility,
    checkYourAnswers: [
      { key: 'whoIsResponsible', value: responsibility.name },
      { key: 'email', value: responsibility.account?.contactDetails?.email || responsibility.contact?.contactDetails?.email },
      (responsibility.responsible === 'other' &&
        { key: 'contactIsOrganisation', value: yesNoFromBool(!!responsibility.account) }),
      (responsibility.account && { key: 'contactOrganisations', value: responsibility.account.name }),
      { key: 'address', value: addressLine(responsibility.account || responsibility.contact) }
    ].filter(a => a)
  }
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const detailsCorrect = boolFromYesNo(pageData.payload['yes-no'])

  if (detailsCorrect) {
    return contactURIs.INVOICE_PAYER.PURCHASE_ORDER.uri
  } else {
    return contactURIs.INVOICE_PAYER.NAME.uri
  }
}

export const invoiceContactDetails = checkAnswersPage({
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.PAYER, RESPONSIBLE),
    checkAccountComplete(AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
  ],
  page: CONTACT_DETAILS.page,
  uri: CONTACT_DETAILS.uri,
  getData,
  completion
})
