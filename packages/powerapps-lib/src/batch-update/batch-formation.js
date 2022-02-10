import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { createBatchRequestObjects, Methods } from '../model/schema/processors/schema-processes.js'

const params = { }

/**
 * Initialize a batch request
 * @param tableSet - The table-set to be included in the updates
 * @param clientUrl - The client url (required for some references within the update
 */
export const openBatchRequest = (tableSet, clientUrl) => {
  params.tableSet = tableSet
  params.batchId = crypto.randomBytes(3).toString('hex').toUpperCase()
  params.clientUrl = clientUrl
  params.batchRequestObject = null
  return params.batchId
}

const batchStart = (b, c) => `--batch_${b}\nContent-Type: multipart/mixed;boundary=changeset_${c}\n\n`

// Warning, the interface is fussy about whitespace
const headerBuilder = (contentId, table, method, powerAppsId) => {
  let result = 'Content-Type: application/http\n'
  result += 'Content-Transfer-Encoding:binary\n'
  result += `Content-ID: ${contentId}\n`
  result += '\n'
  if (method === Methods.PATCH) {
    result += `PATCH ${params.clientUrl}/${table}(${powerAppsId}) HTTP/1.1\n`
  } else if (method === Methods.POST) {
    result += `POST ${params.clientUrl}/${table} HTTP/1.1\n`
  } else if (method === Methods.PUT) {
    result += `PUT ${params.clientUrl}/${table} HTTP/1.1\n`
  }
  result += 'Content-Type: application/json;type=entry\n'
  return result
}

const changeSetStart = cs => `--changeset_${cs}\n`
const changeSetEnd = cs => `--changeset_${cs}--\n`
const batchEnd = () => `--batch_${params.batchId}--\n`

/**
 * Forms an ODATA batch request from the model and the source json
 * See https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/execute-batch-operations-using-web-api
 * @param batchId - The batch identifier created by openBatchRequest
 * @param json
 * @param targetKeysJson
 * @param model
 * @param clientUrl
 * @returns  {Promise<string>} - the text of the batch request body
 */
export const createBatchRequest = async (srcObj, targetKeys) => {
  // Generate the data required for the batch update
  params.batchRequestObjects = await createBatchRequestObjects(srcObj, targetKeys, params.tableSet)

  // Build the batch update request body
  const changeId = uuidv4()
  let body = batchStart(params.batchId, changeId)

  for (const b of params.batchRequestObjects) {
    body += changeSetStart(changeId)
    body += headerBuilder(b.contentId, b.table, b.method, b.powerAppsId)
    body += '\n'
    body += typeof b.assignments === 'object' ? JSON.stringify(b.assignments, null, 2) : b.assignments
    body += '\n\n'
  }

  body += changeSetEnd(changeId)
  body += batchEnd()
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
export const createKeyObject = (responseBody, targetKeys) => {
  const strippedResponseBody = responseBody.replaceAll(params.clientUrl, '')
  targetKeys.forEach(tk => { tk.powerAppsKey = strippedResponseBody.match(preComplied[tk.contentId])?.groups?.eid })
  return targetKeys
}
