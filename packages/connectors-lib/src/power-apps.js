import { SECRETS } from './secrets.js'
import { ClientCredentials } from 'simple-oauth2'
import Config from './config.js'
import pkg from 'node-fetch'
const fetch = pkg.default
const defaultTimeout = 20000
const defaultFetchSize = 100

/*
 * Access to dynamics using the OAuth2 client credentials flow.
 * See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
let accessToken

export const getToken = async () => {
  try {
    // If the oath client id and secret is not set in the environment then look it up
    // from the secrets manager
    const { client, auth } = Config.powerApps.oauth
    let { id, secret } = client
    if (!id || !secret) {
      id = await SECRETS.getSecret('/oauth/client-id')
      secret = await SECRETS.getSecret('/oauth/client-secret')
    }
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

/**
 * Set a server timeout event - default 20 seconds
 */
const abortController = new global.AbortController()

const getBatchOptions = async (batchId, batchRequestBody) => ({
  headers: {
    Authorization: await getToken(),
    'Content-Type': `multipart/mixed;boundary=batch_${batchId}`,
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    Prefer: 'return=representation'
  },
  method: 'POST',
  body: batchRequestBody,
  signal: abortController.signal
})

const getFetchOptions = async () => ({
  headers: {
    Authorization: await getToken(),
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    Prefer: `odata.maxpagesize=${Config.powerApps.client.fetchSize || defaultFetchSize}`
  },
  method: 'GET',
  signal: abortController.signal
})

class HTTPResponseError extends Error {
  constructor (response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}

const checkStatus = response => {
  if (response.ok) {
    return response
  } else {
    throw new HTTPResponseError(response)
  }
}

const errorRegEx = /{"error":{"code":"(?<code>.*)","message":"(?<message>.*)"}}/g

export const POWERAPPS = {
  /**
   * Batch operations against powerapps
   * @param batchId - the batch Id (String)
   * @param batchRequestBody - the batch request body (text)
   * @returns text - the response in plain http/text
   *
   * It throws an 'Error' on general exceptions like network errors and operational errors
   * or an HTTPResponseError where a request has return a non-success response i.e. the status code is not 200...299
   */
  batchRequest: async (batchId, batchRequestBody) => {
    const batchURL = new URL(`${Config.powerApps.client.url}/$batch`).href

    // Set up options for fetch
    const options = await getBatchOptions(batchId, batchRequestBody)

    // Create a timeout
    const timeout = setTimeout(() => {
      abortController.abort()
    }, parseInt(Config.powerApps.client.timeout) || defaultTimeout)

    try {
      // Make the request
      const response = await fetch(batchURL, options)

      // Ready the body text
      let result = ''
      for await (const chunk of response.body) {
        result += chunk.toString()
      }

      // Look for an extractable error message
      const m = result.match(errorRegEx)
      if (m) {
        console.error(`Batch request error: ${m}`)
      }

      // Throw on not-ok
      checkStatus(response)

      return result
    } catch (err) {
      // Note if upgrading to node-fetch version 3 this needs to change
      if (err.name === 'AbortError') {
        // Create a client timeout response
        throw new HTTPResponseError({ status: 408, statusText: 'Request Timeout' })
      } else {
        throw err
      }
    } finally {
      clearTimeout(timeout)
    }
  },
  /**
   * Fetch JSON data (GET request) using the path and maxRows
   * @returns {Promise<void>}
   */
  fetch: async path => {
    const fetchURL = new URL(`${Config.powerApps.client.url}/${path}`).href

    // Set up options for fetch
    const options = await getFetchOptions()

    // Create a timeout
    const timeout = setTimeout(() => {
      abortController.abort()
    }, parseInt(Config.powerApps.client.timeout) || defaultTimeout)

    try {
      // Make the request
      const response = await fetch(fetchURL, options)

      // Throw on not-ok
      checkStatus(response)

      // Ready the body json
      return response.json()
    } catch (err) {
      if (err.name === 'AbortError') {
        // Create a client timeout response
        throw new HTTPResponseError({ status: 408, statusText: 'Request Timeout' })
      } else {
        throw err
      }
    } finally {
      clearTimeout(timeout)
    }
  },
  /**
   * The client URL is used in the formation of the batch payload
   */
  getClientUrl: () => new URL(Config.powerApps.client.url).href,
  /*
   * Export the HTTPResponseError to catch in the caller
   */
  HTTPResponseError
}
