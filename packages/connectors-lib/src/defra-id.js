import { Issuer } from 'openid-client'
import * as jose from 'jose'
import Config from './config.js'
import db from 'debug'
import { checkResponseOkElseThrow, httpFetch } from './fetch-helper.js'
const debug = db('connectors-lib:defra-id')

const defraIdInfo = {}

export const DEFRA_ID = {
  getInfo: () => defraIdInfo,
  /**
   *  Initialize the defraIdInfo object using OpenID discovery
   * @param callbackUri
   * @returns {Promise<void>}
   */
  initialise: async callbackUri => {
    const cb = new URL(callbackUri, Config.defraId.redirectBase)
    defraIdInfo.redirectUri = cb.href
    const issuer = await Issuer.discover(Config.defraId.configUri)
    debug('Discovered issuer %s %O', issuer.issuer, issuer.metadata)
    defraIdInfo.JWKS = jose.createRemoteJWKSet(new URL(issuer.metadata.jwks_uri))
    defraIdInfo.tokenEndpoint = issuer.token_endpoint
    defraIdInfo.client = new issuer.Client({
      client_id: Config.defraId.clientId,
      client_secret: Config.defraId.secret,
      redirect_uris: [defraIdInfo.redirectUri],
      response_types: ['id_token', 'code']
    })
  },
  /**
   * Returns the url used for the user authorization redirect (
   * @returns {string}
   */
  getAuthorizationUrl: () => {
    return defraIdInfo.client.authorizationUrl({
      client_id: Config.defraId.clientId,
      scope: 'openid',
      response_type: 'code',
      serviceId: Config.defraId.serviceId,
      policyName: Config.defraId.policy,
      redirect_uri: defraIdInfo.redirectUri
    })
  },
  /**
   * Fetch the OAuth token given the supplied authorization code
   * @param code
   * @returns {Promise<*>}
   */
  fetchToken: async code => {
    const params = new URLSearchParams({ grant_type: 'authorization_code', code })
    const url = new URL(defraIdInfo.tokenEndpoint)
    url.search = params.toString()

    const bodyParameters = new URLSearchParams({
      client_id: Config.defraId.clientId,
      client_secret: Config.defraId.secret
    })

    const tokenResponse = await httpFetch(url.href,
      'POST',
      bodyParameters.toString(),
      () => ({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }),
      checkResponseOkElseThrow,
      Config.api.timeout)
    console.log(tokenResponse)
    return tokenResponse.id_token
  },
  /**
   * Verifies the token and returns the decoded payload
   * @param jwt
   * @returns {Promise<object>}
   */
  verifyToken: async jwt => {
    try {
      const { payload } = await jose.jwtVerify(jwt, defraIdInfo.JWKS)
      return payload
    } catch (error) {
      console.error(error)
      throw new Error('Token decoding failure')
    }
  }
}
