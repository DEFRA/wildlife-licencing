import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

import { powerAppsObjectBuilder } from '../model/transformer.js'
import { findRequestSequence, getModelNode } from '../model/model-utils.js'

let sequence
let model

/**
 * Initialize a batch request
 * @param model
 */
export const openBatchRequest = m => {
  model = m
  sequence = findRequestSequence(model)
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

const batchStart = (b, c) => `--batch_${b}\nContent-Type: multipart/mixed;boundary=changeset_${c}\n`

// Warning, the interface is fussy about whitespace
const headerBuilder = (obj, id, n, clientUrl) => {
  const reqLine = id ? `PATCH ${clientUrl}/${obj.targetEntity}(${id}) HTTP/1.1` : `POST ${clientUrl}/${obj.targetEntity} HTTP/1.1`
  return `Content-Type: application/http\nContent-Transfer-Encoding:binary\nContent-ID: ${n}\n\n${reqLine}\n` +
    'Content-Type: application/json;type=entry\n\n' // Require two breaks before payload
}

const changeSetStart = c => `\n--changeset_${c}\n`
const changeSetEnd = c => `\n--changeset_${c}--\n`
const batchEnd = b => `\n--batch_${b}--\n`

export const relationshipBuilder = (name, obj) => {
  const contentId = sequence.findIndex(s => s === name) + 1
  return { [`${obj.fk}@odata.bind`]: '$' + contentId }
}

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
export const createBatchRequestBody = async (batchId, json, targetKeysJson, clientUrl) => {
  const changeId = uuidv4()
  let body = batchStart(batchId, changeId)
  const queryResults = await Promise.all(sequence.map(async (s, index) => {
    const node = getModelNode(model, s)
    const payload = await powerAppsObjectBuilder(node[s].targetFields, json)
    const header = headerBuilder(node[s], targetKeysJson?.[s]?.eid, index + 1, clientUrl)
    Object.entries(node[s].relationships || []).filter(([, o]) => !o.readOnly).forEach(([name, o]) =>
      Object.assign(payload, relationshipBuilder(name, o)))

    return { index, str: `${changeSetStart(changeId)}${header}${JSON.stringify(payload, null, 4)}` }
  }))

  body = body.concat(queryResults.sort(qr => qr.index).map(qr => qr.str).join('\n'))
  body = body.concat(changeSetEnd(changeId))
  body = body.concat(batchEnd(batchId))

  return body
}

/*
 * Create a set of pre-compiled regular expressions to extract the enity keys from the batch response
 */
const preComplied = (n =>
  ([...Array(n).keys()].map(i => i + 1).map(i => new RegExp(`Content-ID: ${i}[\\w\\n\\s\\/.\\-:]*Location: \\/(?<entity>.*)\\((?<eid>.*)\\)`))))(10)

/*
 * Create a key object from the response body text
 */
export const createKeyObject = (responseBody, baseUrl) => {
  const strippedResponseBody = responseBody.replaceAll(baseUrl, '')
  const searchResponse = id => strippedResponseBody.match(preComplied[id - 1])?.groups || {}
  return sequence.reduce((p, c) => ({ ...p, [c]: searchResponse(sequence.findIndex(s => s === c) + 1) }), {})
}
