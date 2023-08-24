import * as pkg from 'object-hash'
import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS, TASKLIST } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../constants.js'
import { ApplicationService } from '../../services/application.js'
import { LICENCE_TYPE_TASKLISTS } from './licence-type.js'
import { Backlink } from '../../handlers/backlink.js'
import { accountOperations, contactOperations } from '../contact/common/operations.js'
import { AccountRoles, ContactRoles } from '../contact/common/contact-roles.js'
const hash = pkg.default

const contactMatcher = c => ({
  fullName: c.fullName,
  contactDetails: c.contactDetails,
  address: c.address
})

const accountMatcher = a => ({
  name: a.name,
  contactDetails: a.contactDetails,
  address: a.address
})

/**
 * Set us the contact for the IDM user. if we have one that matches exactly, reuse it. It may be cloned
 * later if modified
 * @param applicationId
 * @param userId
 * @param contactRole
 * @returns {Promise<void>}
 */
export const setUpIDMContacts = async (applicationId, userId, contactRole) => {
  const contacts = await APIRequests.CONTACT.findContactsByIDMUser(userId)
  const contactOps = contactOperations(contactRole, applicationId, userId)
  if (!contacts.length) {
    await contactOps.create(true)
  } else {
    const user = await APIRequests.USER.getById(userId)
    const contact = contacts.find(c => hash(contactMatcher(c)) === hash(contactMatcher(user)))
    if (contact) {
      await contactOps.assign(contact.id)
    } else {
      await contactOps.create(true)
    }
  }
}

export const setUpIDMAccounts = async (applicationId, organisationId, accountRole) => {
  const accounts = await APIRequests.ACCOUNT.findAccountsByIDMOrganisation(organisationId)
  const accountOps = accountOperations(accountRole, applicationId, organisationId)
  if (!accounts.length) {
    await accountOps.create(true)
  } else {
    const organisation = await APIRequests.USER.getOrganisation(organisationId)
    const account = accounts.find(a => hash(accountMatcher(a)) === hash(accountMatcher(organisation)))
    if (account) {
      await accountOps.assign(account.id)
    } else {
      await accountOps.create(true)
    }
  }
}

/**
 * Assumes to be authenticated
 * @param request
 * @returns {Promise<*>}
 */
export const getApplication = async request => {
  const params = new URLSearchParams(request.query)
  const id = params.get('applicationId')
  // Switching the application. It is previously checked for a valid user association
  if (id) {
    await ApplicationService.switchApplication(request, id)
    return APIRequests.APPLICATION.getById(id)
  } else {
    // Expect the application to be set in the cache
    const { applicationId, userId, applicationRole, organisationId } = await request.cache().getData()
    // If created newly, it requires to be associated to the user and assigned a reference number
    // (The call is idempotent
    const { application } = await APIRequests.APPLICATION.initialize(userId, applicationId, DEFAULT_ROLE, applicationRole)

    // If the user is the applicant or ecologist on this application
    // create the user contact and optional account and assign them to the role
    if ([ContactRoles.ECOLOGIST, ContactRoles.APPLICANT].includes(applicationRole)) {
      await setUpIDMContacts(applicationId, userId, applicationRole)
      if (organisationId) {
        await setUpIDMAccounts(applicationId, organisationId, applicationRole
          ? AccountRoles.ECOLOGIST_ORGANISATION
          : AccountRoles.APPLICANT_ORGANISATION)
      }
    }
    return application
  }
}

export const getData = async request => {
  const application = await getApplication(request)
  // Select the tasklist based on the licence type
  const licenceType = LICENCE_TYPE_TASKLISTS[application.applicationTypeId]
  const showReference = await licenceType.canShowReference(request)
  return {
    ...(showReference && { reference: application.applicationReferenceNumber }),
    reference: application.applicationReferenceNumber,
    licenceType: licenceType.name,
    licenceTypeMap: await licenceType.decorate(request),
    progress: await licenceType.getProgress(request)
  }
}

/**
 * Redirect to the applications' page if:
 * (1) given an applicationId in the query parameter, and it does not belong to the signed-in user
 * (2) If there is no applicationId set in the user cache
 * (3) The applicationId set in the user cache does not exist
 */
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const params = new URLSearchParams(request.query)
  if (params.get('applicationId')) {
    const id = params.get('applicationId')
    // Check is assigned to the user with the default role
    const roles = await APIRequests.APPLICATION.findRoles(journeyData.userId, id)
    if (!roles.includes(DEFAULT_ROLE)) {
      return h.redirect(APPLICATIONS.uri)
    }
    const application = await APIRequests.APPLICATION.getById(id)
    if (application?.userSubmission) {
      return h.redirect(APPLICATIONS.uri)
    }
  } else {
    if (journeyData.applicationId && journeyData.applicationRole) {
      const application = APIRequests.APPLICATION.getById(journeyData.applicationId)
      if (!application) {
        return h.redirect(APPLICATIONS.uri)
      }
    } else {
      return h.redirect(APPLICATIONS.uri)
    }
  }

  return null
}

export const tasklistBacklink = async request => {
  if (request.auth.isAuthenticated) {
    const { userId } = await request.cache().getData()
    const applications = await APIRequests.APPLICATION.findByUser(userId)
    return applications.length > 1 ? Backlink.JAVASCRIPT.value() : Backlink.NO_BACKLINK.value()
  } else {
    return Backlink.NO_BACKLINK.value()
  }
}

export const tasklist = pageRoute({
  page: TASKLIST.page,
  uri: TASKLIST.uri,
  backlink: new Backlink(tasklistBacklink),
  checkData,
  getData
})
