import { ClientCredentials } from 'simple-oauth2'
import Config from './config.js'

/*
 * Access to dynamics using the OAuth2 client credentials flow.
 * See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
let accessToken

export const POWERAPPS = {
  getToken: async () => {
    try {
      const EXPIRATION_WINDOW_SECONDS = 60
      const oauthClient = new ClientCredentials(Config.powerApps.oauth)
      if (!accessToken || accessToken.expired(EXPIRATION_WINDOW_SECONDS)) {
        accessToken = await oauthClient.getToken({ scope: Config.powerApps.scope })
      }
      return accessToken
    } catch (error) {
      console.log('Access Token Error', error.message)
      throw new Error(`OAUTH access token error ${error.message}`)
    }
  },
  batchRequest: async () => {

  }
}
