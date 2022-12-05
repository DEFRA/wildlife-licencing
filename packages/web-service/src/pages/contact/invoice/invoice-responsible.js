import pageRoute from '../../../routes/page-route.js'
import { contactURIs, TASKLIST } from '../../../uris.js'
import Joi from 'joi'
import { APIRequests } from '../../../services/api-requests.js'
import { ContactRoles, AccountRoles } from '../common/contact-roles.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { moveTagInProgress } from '../../common/tag-functions.js'
import { accountOperations, contactOperations } from '../common/operations.js'
import { canBeUser } from '../common/common-handler.js'
import { hasContactCandidates } from '../common/common.js'
import { checkApplication } from '../../common/check-application.js'

const { RESPONSIBLE, USER, CHECK_ANSWERS, NAMES, NAME } = contactURIs.INVOICE_PAYER

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(applicationId)
  const ecologist = await APIRequests.CONTACT.role(ContactRoles.ECOLOGIST).getByApplicationId(applicationId)
  if (!applicant || !ecologist) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(applicationId)
  const ecologist = await APIRequests.CONTACT.role(ContactRoles.ECOLOGIST).getByApplicationId(applicationId)
  const payer = await APIRequests.CONTACT.role(ContactRoles.PAYER).getByApplicationId(applicationId)

  await moveTagInProgress(applicationId, SECTION_TASKS.INVOICE_PAYER)

  const currentPayer = (() => {
    if (!payer) {
      return null
    } else if (applicant.id === payer.id) {
      return 'applicant'
    } else if (ecologist.id === payer.id) {
      return 'ecologist'
    } else {
      return 'other'
    }
  })()

  return {
    currentPayer,
    applicantName: applicant.fullName,
    ecologistName: ecologist.fullName
  }
}

export const setData = async request => {
  const { applicationId, userId } = await request.cache().getData()
  switch (request.payload.responsible) {
    case 'applicant':
      {
        const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(applicationId)
        const applicantOrganisation = await APIRequests.ACCOUNT.role(AccountRoles.APPLICANT_ORGANISATION).getByApplicationId(applicationId)
        await APIRequests.CONTACT.role(ContactRoles.PAYER).assign(applicationId, applicant.id)
        if (applicantOrganisation) {
          await APIRequests.ACCOUNT.role(AccountRoles.PAYER_ORGANISATION).assign(applicationId, applicantOrganisation.id)
        }
      }
      break
    case 'ecologist':
      {
        const ecologist = await APIRequests.CONTACT.role(ContactRoles.ECOLOGIST).getByApplicationId(applicationId)
        const ecologistOrganisation = await APIRequests.ACCOUNT.role(AccountRoles.ECOLOGIST_ORGANISATION).getByApplicationId(applicationId)
        await APIRequests.CONTACT.role(ContactRoles.PAYER).assign(applicationId, ecologist.id)
        if (ecologistOrganisation) {
          await APIRequests.ACCOUNT.role(AccountRoles.PAYER_ORGANISATION).assign(applicationId, ecologistOrganisation.id)
        }
      }

      break
    default: {
      // Will be created in the user page unless the applicant of the ecologist is the signed-in user in which case created it here
      const contactOps = contactOperations(ContactRoles.PAYER, applicationId, userId)
      const accountOps = accountOperations(AccountRoles.PAYER_ORGANISATION, applicationId)
      // Un-assign payer and payer organisation. Will be created in the user handler or the name pages
      await contactOps.unAssign()
      await accountOps.unAssign()
    }
  }
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload.responsible === 'other') {
    // If the ecologist or applicant contact is the signed-in user then do ask the 'is the payer the signed-in user?'
    // question and set that explicitly to 'no', returning the NAMES page
    if (await canBeUser(request, [ContactRoles.APPLICANT, ContactRoles.ECOLOGIST])) {
      return USER.uri
    } else {
      const { applicationId, userId } = await request.cache().getData()
      if (await hasContactCandidates(userId, applicationId, ContactRoles.PAYER, [], false)) {
        return NAMES.uri
      } else {
        return NAME.uri
      }
    }
  }

  return CHECK_ANSWERS.uri
}

export const invoiceResponsible = pageRoute({
  page: RESPONSIBLE.page,
  uri: RESPONSIBLE.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    responsible: Joi.any().valid('applicant', 'ecologist', 'other').required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData: setData,
  completion: completion,
  getData
})
