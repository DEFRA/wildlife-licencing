import { ClientCredentials } from 'simple-oauth2'
import Config from './config.js'
import pkg from 'node-fetch'
const fetch = pkg.default

/*
 * Access to dynamics using the OAuth2 client credentials flow.
 * See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
let accessToken

export const getToken = async () => {
  try {
    const oauthClient = new ClientCredentials(Config.powerApps.oauth)
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
    }, parseInt(Config.powerApps.client.timeout) || 20000)

    try {
      // Make the request
      const response = await fetch(batchURL, options)

      // Throw on not-ok
      checkStatus(response)

      // Ready the body text
      let result = ''
      for await (const chunk of response.body) {
        result += chunk.toString()
      }

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
   * The client URL is used in the formation of the batch payload
   */
  getClientUrl: () => new URL(Config.powerApps.client.url).href,
  /*
   * Export the HTTPResponseError to catch in the caller
   */
  HTTPResponseError
}
