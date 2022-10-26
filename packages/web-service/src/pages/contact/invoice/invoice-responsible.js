import pageRoute from '../../../routes/page-route.js'
import { contactURIs, TASKLIST } from '../../../uris.js'
import Joi from 'joi'
import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { ContactRoles, AccountRoles } from '../common/contact-roles.js'
import { checkHasApplication } from '../common/common.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

const { RESPONSIBLE, USER } = contactURIs.INVOICE_PAYER

export const checkData = async (request, h) => {
  const ck = await checkHasApplication(request, h)
  if (ck) {
    return ck
  }
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

  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.IN_PROGRESS })

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
  const { applicationId } = await request.cache().getData()
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
      const payer = await APIRequests.CONTACT.role(ContactRoles.PAYER).getByApplicationId(applicationId)
      const payerOrganisation = await APIRequests.ACCOUNT.role(AccountRoles.PAYER_ORGANISATION).getByApplicationId(applicationId)

      if (payer) {
        await APIRequests.CONTACT.role(ContactRoles.PAYER).unAssign(applicationId, payer.id)
      }

      if (payerOrganisation) {
        await APIRequests.ACCOUNT.role(AccountRoles.PAYER_ORGANISATION).unAssign(applicationId, payerOrganisation.id)
      }
    }
  }
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload.responsible === 'other') {
    return USER.uri
  }

  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE })
  return TASKLIST.uri
}

export const invoiceResponsible = pageRoute({
  page: RESPONSIBLE.page,
  uri: RESPONSIBLE.uri,
  checkData: checkData,
  getData: getData,
  validator: Joi.object({
    responsible: Joi.any().valid('applicant', 'ecologist', 'other').required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData: setData,
  completion: completion
})
