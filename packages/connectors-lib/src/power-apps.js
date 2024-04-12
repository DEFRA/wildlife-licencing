import { ClientCredentials } from 'simple-oauth2'
import Config from './config.js'
import { hide } from './utils.js'
import {
  HTTPResponseError,
  httpFetch
} from './fetch-helper.js'

import db from 'debug'
import * as _cloneDeep from 'lodash.clonedeep'

const APPLICATION_JSON = 'application/json'
const DEFAULT_FETCH_SIZE = 100
const debug = db('connectors-lib:power-platform')
const { default: cloneDeep } = _cloneDeep

/*
 * Access to dynamics using the OAuth2 client credentials flow.
 * See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const accessToken = []

export const getToken = async platform => {
  try {
    const msg = cloneDeep(platform)
    hide(msg, 'oauth.client.id')
    hide(msg, 'oauth.client.secret')
    debug(`Power Platform connections: ${JSON.stringify(msg)}`)
    const { client, auth } = platform.oauth
    const { id, secret } = client
    const oauthClient = new ClientCredentials({ client: { id, secret }, auth })
    const tokenKey = platform.client.url
    if (!accessToken[tokenKey] || accessToken[tokenKey].expired(platform.tokenExpireWindow || 60)) {
      accessToken[tokenKey] = await oauthClient.getToken({ scope: platform.scope })
    }
    return `${accessToken[tokenKey].token.token_type} ${accessToken[platform.client.url].token.access_token}`
  } catch (error) {
    console.log('Access Token Error', error.message)
    throw new Error(`OAUTH access token error ${error.message}`)
  }
}

const fetchHeaderFunction = platform => async () => ({
  Authorization: await getToken(platform),
  'Content-Type': 'application/json',
  'OData-MaxVersion': '4.0',
  'OData-Version': '4.0',
  Prefer: `odata.maxpagesize=${platform.client.fetchSize || DEFAULT_FETCH_SIZE}`
})

const batchHeaderFunction = platform => async batchId => ({
  Authorization: await getToken(platform),
  'Content-Type': `multipart/mixed;boundary=batch_${batchId}`,
  'OData-MaxVersion': '4.0',
  'OData-Version': '4.0',
  Prefer: 'return=representation'
})

const checkResponseOkElseThrowError = async responsePromise => {
  const response = await responsePromise
  debug(`HTTP response code: ${JSON.stringify(response.status)}`)
  if (response.ok) {
    if (response.status === 204) {
      return null
    } else {
      if (response.headers.get('content-type').includes(APPLICATION_JSON)) {
        return response.json()
      } else {
        return response.body
      }
    }
  } else {
    if (response.status === 404) {
      if (response.headers.get('content-type').includes(APPLICATION_JSON)) {
        return response.json()
      } else {
        return response.body
      }
    } else {
      throw new HTTPResponseError(response)
    }
  }
}

const batchResponseFunction = async responsePromise => {
  const response = await checkResponseOkElseThrowError(responsePromise)
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

const getPlatform = platform => ({
  /**
   * Batch operations to update the Power Platform
   * @param requestHandle
   * @param batchRequestBody
   * @returns {Promise<*|undefined>}
   */
  batchRequest: async (requestHandle, batchRequestBody) =>
    httpFetch(new URL(`${platform.client.url}/$batch`).href,
      'POST',
      batchRequestBody,
      () => batchHeaderFunction(platform)(requestHandle.batchId),
      batchResponseFunction,
      platform.client.timeout),

  /**
     * Get operations to retrieve data from Power Platform
     * @param path
     * @returns {Promise<void>}
     */
  fetch: async path =>
    httpFetch(new URL(`${platform.client.url}/${path}`).href,
      'GET',
      null,
      fetchHeaderFunction(platform),
      fetchResponseFunction,
      platform.client.timeout),

  getClientUrl: () => new URL(platform.client.url).href,
  /*
     * Export the HTTPResponseError to catch in the caller
     */
  HTTPResponseError
})

export const POWERAPPS = getPlatform(Config.powerApps)
export const DEFRA_CUSTOMER = getPlatform(Config.defraCustomer)
