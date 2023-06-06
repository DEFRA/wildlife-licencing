import { DEFRA_ID } from '@defra/wls-connectors-lib'
import { DEFRA_IDM_CALLBACK } from '../uris.js'
import { APIRequests } from '../services/api-requests.js'

/**
 * Search the database for a user with the id of the contact
 * @param request
 * @param tokenPayload
 * @returns {Promise<void>}
 */
export const consumeTokenPayload = async (request, tokenPayload) => {
  // const user = await APIRequests.USER.getById(tokenPayload.contactId)
  // const username = request.payload.username.toLowerCase()
  // const result = await APIRequests.USER.findByName(username)
  // debug(`Logging in user: ${username}`)
  // await request.cache().setAuthData(result)
  // const journeyData = await request.cache().getData() || {}
  // Object.assign(journeyData, { userId: result.id })
  // await request.cache().setData(journeyData)
  //
  // // if the cookies preferences are set in the session then write it into the user
  // if (journeyData.cookies) {
  //   const user = await APIRequests.USER.getById(journeyData.userId)
  //   Object.assign(user, { cookiePrefs: journeyData.cookies })
  //   await APIRequests.USER.update(journeyData.userId, user)
  // }
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
  handler: async (request, h) => {
    const params = new URLSearchParams(request.query)
    const code = params.get('code')
    const token = await DEFRA_ID.fetchToken(code)
    const tokenPayload = await DEFRA_ID.verifyToken(token)
    await consumeTokenPayload(request, tokenPayload)
    console.log(tokenPayload)
    return h.redirect('/which-species')
  },
  options: { auth: false }
}
