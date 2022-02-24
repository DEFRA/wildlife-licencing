import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { createBatchRequestObjects, Methods } from '../schema/processors/schema-processes.js'

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
  if (method === Methods.PATCH) {
    result += `PATCH ${requestHandle.clientUrl}/${table}(${powerAppsId}) HTTP/1.1\n`
  } else if (method === Methods.POST) {
    result += `POST ${requestHandle.clientUrl}/${table} HTTP/1.1\n`
  } else if (method === Methods.PUT) {
    result += `PUT ${requestHandle.clientUrl}/${table} HTTP/1.1\n`
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
 * @param srcObj - The data to be serialized
 * @param targetKeys - The key set
 */
export const createBatchRequest = async (requestHandle, srcObj, targetKeys) => {
  // Generate the data required for the batch update
  requestHandle.batchRequestObjects = await createBatchRequestObjects(srcObj, targetKeys, requestHandle.tableSet)

  // Build the batch update request body
  const changeId = uuidv4()
  let body = batchStart(requestHandle.batchId, changeId)

  for (const b of requestHandle.batchRequestObjects) {
    body += changeSetStart(changeId)
    body += headerBuilder(requestHandle, b.contentId, b.table, b.method, b.powerAppsId)
    body += '\n'
    body += JSON.stringify(b.assignments, null, 2)
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
  ([...Array(n).keys()].map(i => new RegExp(`Content-ID: ${i}[\\w\\n\\s\\/.\\-:]*Location: \\/(?<entity>.*)\\((?<eid>.*)\\)`))))(20)

/*
 * Create a key object from the response body text
 */
export const createKeyObject = (requestHandle, responseBody, targetKeys) => {
  const strippedResponseBody = responseBody.replaceAll(requestHandle.clientUrl, '')
  targetKeys.forEach(tk => {
    tk.powerAppsKey = strippedResponseBody.match(preComplied[tk.contentId])?.groups?.eid
  })
  return targetKeys
}
