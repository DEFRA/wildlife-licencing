import { DEFRA_ID } from '@defra/wls-connectors-lib'
import { DEFRA_IDM_CALLBACK } from '../uris.js'

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
    console.log(tokenPayload)
    return h.redirect('/which-species')
  },
  options: { auth: false }
}
