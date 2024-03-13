import crypto from 'crypto'
import db from 'debug'
import { v4 as uuidv4 } from 'uuid'
import { createBatchRequestObjects, Methods } from '../schema/processors/schema-processes.js'

const debug = db('powerapps-lib:batch-formation')

/**
 * Initialize a batch request
 * @param tableSet - The table-set to be included in the updates
 * @param clientUrl - The client url (required for some references within the update
 */
export const openBatchRequest = (tableSet, clientUrl) => {
  return {
    tableSet: tableSet,
    batchId: crypto.randomBytes(3).toString('hex').toUpperCase(),
    clientUrl: clientUrl
  }
}

const batchStart = (b, c) => `--batch_${b}\nContent-Type: multipart/mixed;boundary=changeset_${c}\n\n`

// Warning, the interface is fussy about whitespace
const headerBuilder = (requestHandle, contentId, table, method, powerAppsId) => {
  let result = 'Content-Type: application/http\n'
  result += 'Content-Transfer-Encoding:binary\n'
  result += `Content-ID: ${contentId}\n`
  result += '\n'

  switch (method) {
    case Methods.PATCH:
      result += `PATCH ${requestHandle.clientUrl}/${table}(${powerAppsId}) HTTP/1.1\n`
      break
    case Methods.POST:
      result += `POST ${requestHandle.clientUrl}/${table} HTTP/1.1\n`
      break
    case Methods.PUT:
      result += `PUT ${requestHandle.clientUrl}/${table} HTTP/1.1\n`
      break
  }

  result += 'Content-Type: application/json;type=entry\n'
  return result
}

const changeSetStart = cs => `--changeset_${cs}\n`
const changeSetEnd = cs => `--changeset_${cs}--\n`
const batchEnd = requestHandle => `--batch_${requestHandle.batchId}--\n`

/**
 * Forms an ODATA batch request from the model and the source json
 * See https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/execute-batch-operations-using-web-api
 * @returns  {Promise<string>} - the text of the batch request body
 * @param requestHandle - Object containing the current request state
 * @param payload - The data to be serialized
 */
export const createBatchRequest = async (requestHandle, payload) => {
  // Generate the data required for the batch update
  requestHandle.batchRequestObjects = await createBatchRequestObjects(payload, requestHandle.tableSet)

  // Build the batch update request body
  const changeId = uuidv4()
  let body = batchStart(requestHandle.batchId, changeId)
  // __URL__
  for (const b of requestHandle.batchRequestObjects) {
    debug(`Creating batch request for: ${JSON.stringify(b)}`)
    const assignments = Object.entries(b.assignments)
      .reduce((a, [key, value]) => ({
        ...a,
        [key]: value.toString().includes('__URL__')
          ? value.replace('__URL__', requestHandle.clientUrl)
          : value
      }), {})
    body += changeSetStart(changeId)
    body += headerBuilder(requestHandle, b.contentId, b.table, b.method, b.powerAppsId)
    body += '\n'
    body += JSON.stringify(assignments, null, 2)
    body += '\n\n'
  }

  body += changeSetEnd(changeId)
  body += batchEnd(requestHandle)
  return body
}

/*
 * Create a set of pre-compiled regular expressions to extract the table keys from the batch response
 */
const preComplied = (n =>
  ([...Array(n).keys()].map(i => new RegExp(`Content-ID: ${i}[\\w\\n\\s\\/.\\-:]*Location: \\/(?<entity>.*)\\((?<eid>.*)\\)`))))(200)

/**
 * Create a key array from the response body text and the batch request object
 * @param requestHandle
 * @param responseBody
 * @returns {*[]}
 */
export const createKeyObject = (requestHandle, responseBody) => {
  const result = []
  const strippedResponseBody = responseBody.replaceAll(requestHandle.clientUrl, '')
  for (const batchRequestObject of requestHandle.batchRequestObjects) {
    const sddsId = strippedResponseBody.match(preComplied[batchRequestObject.contentId])?.groups?.eid
    if (sddsId) {
      result.push({
        apiTableName: batchRequestObject.apiTable,
        keys: {
          apiKey: batchRequestObject.apiKey,
          sddsKey: sddsId
        }
      })
    }
  }

  return result
}
