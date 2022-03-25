import { ClientCredentials } from 'simple-oauth2'
import Config from './config.js'
import { hide } from './utils.js'
import {
  HTTPResponseError,
  httpFetch,
  checkResponseOkElseThrow
} from './fetch-helper.js'

import db from 'debug'
import * as _cloneDeep from 'lodash.clonedeep'

const DEFAULT_FETCH_SIZE = 100
const debug = db('connectors-lib:power-platform')
const { default: cloneDeep } = _cloneDeep

/*
 * Access to dynamics using the OAuth2 client credentials flow.
 * See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
let accessToken

export const getToken = async () => {
  try {
    const msg = cloneDeep(Config.powerApps)
    hide(msg, 'oauth.client.id')
    hide(msg, 'oauth.client.secret')
    debug(`Power Platform connections: ${JSON.stringify(msg, null, 4)}`)
    const { client, auth } = Config.powerApps.oauth
    const { id, secret } = client
    const oauthClient = new ClientCredentials({ client: { id, secret }, auth })
    if (!accessToken || accessToken.expired(Config.powerApps.tokenExpireWindow || 60)) {
      accessToken = await oauthClient.getToken({ scope: Config.powerApps.scope })
    }
    return `${accessToken.token.token_type} ${accessToken.token.access_token}`
  } catch (error) {
    console.log('Access Token Error', error.message)
    throw new Error(`OAUTH access token error ${error.message}`)
  }
}

const fetchHeaderFunction = async () => ({
  Authorization: await getToken(),
  'Content-Type': 'application/json',
  'OData-MaxVersion': '4.0',
  'OData-Version': '4.0',
  Prefer: `odata.maxpagesize=${Config.powerApps.client.fetchSize || DEFAULT_FETCH_SIZE}`
})

const batchHeaderFunction = async batchId => ({
  Authorization: await getToken(),
  'Content-Type': `multipart/mixed;boundary=batch_${batchId}`,
  'OData-MaxVersion': '4.0',
  'OData-Version': '4.0',
  Prefer: 'return=representation'
})

const batchResponseFunction = async responsePromise => {
  const response = await checkResponseOkElseThrow(responsePromise)
  const errorRegEx = /{"error":{"code":"(?<code>.*)","message":"(?<message>.*)"}}/g
  let result = ''
  for await (const chunk of response) {
    result += chunk.toString()
  }

  // Look for an extractable error message
  const m = result.match(errorRegEx)
  if (m) {
    console.error(`Batch request error: ${m}`)
  }

  return result
}

/**
 * Simplified response function - for fetches from power apps
 * a status 200 with a JSON payload is always expected
 * @param responsePromise
 * @returns {Promise<*>}
 */
const fetchResponseFunction = async responsePromise => {
  const response = await responsePromise
  if (response.ok) {
    return response.json()
  } else {
    throw new HTTPResponseError(response)
  }
}

export const POWERAPPS = {
  /**
   * Batch operations to update the Power Platform
   * @param requestHandle
   * @param batchRequestBody
   * @returns {Promise<*|undefined>}
   */
  batchRequest: async (requestHandle, batchRequestBody) =>
    httpFetch(new URL(`${Config.powerApps.client.url}/$batch`).href,
      'POST',
      batchRequestBody,
      () => batchHeaderFunction(requestHandle.batchId),
      batchResponseFunction,
      Config.powerApps.client.timeout),

  /**
   * Get operations to retrieve data from Power Platform
   * @param path
   * @returns {Promise<void>}
   */
  fetch: async path =>
    httpFetch(new URL(`${Config.powerApps.client.url}/${path}`).href,
      'GET',
      null,
      fetchHeaderFunction,
      fetchResponseFunction,
      Config.powerApps.client.timeout),

  getClientUrl: () => new URL(Config.powerApps.client.url).href,
  /*
   * Export the HTTPResponseError to catch in the caller
   */
  HTTPResponseError
}
