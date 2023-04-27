import Joi from 'joi'
import { contactURIs } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { AccountRoles, ContactRoles } from '../common/contact-roles.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'
import { addressLine } from '../../service/address.js'
import { checkAccountComplete, checkHasContact } from '../common/common-handler.js'
import { checkApplication } from '../../common/check-application.js'
import { generateOutput } from './common.js'

const { CONTACT_DETAILS, RESPONSIBLE } = contactURIs.INVOICE_PAYER

export const getData = async request => {
  const responsibility = await generateOutput(request)

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
  page: CONTACT_DETAILS.page,
  uri: CONTACT_DETAILS.uri,
  validator: Joi.object({
    'yes-no': Joi.any().valid('yes', 'no').required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: [
    checkApplication,
    checkHasContact(ContactRoles.PAYER, RESPONSIBLE),
    checkAccountComplete(AccountRoles.PAYER_ORGANISATION, contactURIs.INVOICE_PAYER)
  ],
  getData,
  completion
})
