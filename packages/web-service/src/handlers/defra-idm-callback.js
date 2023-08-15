import { DEFRA_ID } from '@defra/wls-connectors-lib'
import { APPLICATIONS, DEFRA_IDM_CALLBACK, TASKLIST } from '../uris.js'
import { APIRequests } from '../services/api-requests.js'
import db from 'debug'
const debug = db('web-service:authenticate')

/**
 * Search the database for a user with the id of the contact
 * @param request
 * @param tokenPayload
 * @returns {Promise<void>}
 */
export const consumeTokenPayload = async (request, tokenPayload) => {
  const journeyData = await request.cache().getData() || {}

  // if the signed-in user has changed then delete any application data
  if (journeyData.userId && journeyData.userId !== tokenPayload.contactId) {
    delete journeyData.applicationid
  }

  const user = await APIRequests.USER.getById(tokenPayload.contactId)

  if (!user) {
    const payload = {
      username: tokenPayload.uniqueReference,
      contactDetails: { email: tokenPayload.email },
      fullName: tokenPayload.firstName + ' ' + tokenPayload.lastName
    }
    if (journeyData?.cookies) {
      Object.assign(payload, { cookiePrefs: journeyData.cookies })
    }
    debug(`Create user: ${JSON.stringify(payload, null, 4)}`)
    await APIRequests.USER.createIDM(tokenPayload.contactId, payload)
    await APIRequests.USER.requestUserDetails(tokenPayload.contactId)
  } else {
    debug(`Found user: ${JSON.stringify(user, null, 4)}`)
    await APIRequests.USER.requestUserDetails(user.id)
    if (journeyData?.cookies) {
      Object.assign(user, { cookiePrefs: journeyData?.cookies })
      await APIRequests.USER.update(tokenPayload.contactId, user)
    }
  }

  const relationships = tokenPayload.relationships.map(r => {
    const [userOrganisationId, organisationId, organisationName, , relationshipType] = r.split(':')
    return { userOrganisationId, organisationId, organisationName, relationshipType }
  })

  for (const rel of relationships) {
    if (rel.relationshipType !== 'Citizen') {
      const organisation = await APIRequests.USER.updateOrganisation(rel.organisationId, { name: rel.organisationName })
      debug(`Setting organisation: ${JSON.stringify(organisation, null, 4)}`)
      await APIRequests.USER.updateUserOrganisation(rel.userOrganisationId, {
        userId: tokenPayload.contactId,
        organisationId: rel.organisationId,
        relationship: rel.relationshipType
      })
      await APIRequests.USER.requestOrganisationDetails(rel.organisationId)
    }
  }

  debug(`Setting auth: ${JSON.stringify(tokenPayload, null, 4)}`)
  await request.cache().setAuthData(tokenPayload)

  const role = tokenPayload.roles
    .map(r => ({ relationshipId: r.split(':')[0], roleName: r.split(':')[1] }))
    .find(r => r.relationshipId === tokenPayload.currentRelationshipId)

  const currentRelationship = relationships.find(r => tokenPayload.currentRelationshipId === r.userOrganisationId)

  debug(`Setting role: ${role?.roleName}`)
  debug(`Setting organisation: ${currentRelationship?.organisationName}`)
  debug(`Setting relationshipType: ${currentRelationship?.relationshipType}`)

  Object.assign(journeyData, {
    userId: tokenPayload.contactId,
    ...(currentRelationship?.userOrganisationId && {
      userOrganisationId: currentRelationship.userOrganisationId,
      organisationId: currentRelationship.organisationId
    }),
    relationshipType: currentRelationship?.relationshipType,
    role: role?.roleName
  })

  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (!request.auth.isAuthenticated) {
    return TASKLIST.uri
  } else {
    if (journeyData.applicationId) {
      return TASKLIST.uri
    } else {
      return APPLICATIONS.uri
    }
  }
}

export const defraIdmCallbackPreAuth = async (request, h) => {
  if (request.path === DEFRA_IDM_CALLBACK.uri) {
    const params = new URLSearchParams(request.query)
    const code = params.get('code')
    debug(`Got code: ${code.substring(0, 10)}...`)
    const token = await DEFRA_ID.fetchToken(code)
    const tokenPayload = await DEFRA_ID.verifyToken(token)
    await consumeTokenPayload(request, tokenPayload)
  }
  return h.continue
}

export const defraIdmCallback = {
  method: 'GET',
  path: DEFRA_IDM_CALLBACK.uri,
  /**
   * This is the callback handler for redirects from the DefraId service.
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  handler: async (request, h) => h.redirect(await completion(request))
}
