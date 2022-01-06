import jp from 'jsonpath'
import crypto from 'crypto'
import { model } from '../model/sdds-model.js'
import pkg from 'uuid'
const { v4: uuidv4 } = pkg

class UnrecoverableError extends Error {}

/*
 * Traverses the model and locates all the nodes starting
 * at the leaves and progressing towards the trunk. This is the order
 * that the entity operation ODATA queries will need to be run
 */
export const findRequestSequence = (node, sequence = []) => {
  const nodeName = Object.keys(node)[0]
  if (!node[nodeName].relationships) {
    sequence.push(nodeName)
    return sequence
  }

  for (const r in node[nodeName].relationships) {
    if (!node[nodeName].relationships[r]) {
      sequence.push(r)
    } else {
      findRequestSequence({ [r]: node[nodeName].relationships[r] }, sequence)
    }
  }

  sequence.push(nodeName)
  return sequence
}

const batchStart = (b, c) => `--batch_${b}\nContent-Type: multipart/mixed;boundary=changeset_${c}\n`
const headerBuilder = (obj, n, urlbase) =>
  `Content-Type: application/http\nContent-Transfer-Encoding:binary\nContent-ID: ${n}\n\n` +
  `POST ${urlbase}/${obj.targetEntity} HTTP/1.1\n` +
  'Content-Type: application/json;type=entry\n\n' // Require two breaks before payload
const changeSetStart = c => `\n--changeset_${c}\n`
const changeSetEnd = c => `\n--changeset_${c}--\n`
const batchEnd = b => `\n--batch_${b}--\n`

export const objectBuilder = (fields, src, obj = {}) => {
  for (const field in fields) {
    if (fields[field].srcJsonPath) {
      Object.assign(obj, { [field]: jp.query(src, fields[field].srcJsonPath)[0] })
    } else {
      const f = {}
      Object.assign(obj, { [field]: f })
      objectBuilder(fields[field], src, f)
    }
  }
  return obj
}

export const relationshipBuilder = (name, obj, sequence) => {
  const contentId = sequence.findIndex(s => s === name) + 1
  return { [obj.fk]: '$' + contentId }
}

export const openBatchRequest = () => crypto.randomBytes(3).toString('hex').toUpperCase()

/**
 * Forms an ODATA batch request from the model and the source json
 * See https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/execute-batch-operations-using-web-api
 * @param batch - the batch identifier
 * @param sequence - the sequence to perform the operations
 * @param src - the source data, a json object
 * @param urlbase
 * @returns {string} - the text of the batch request body
 */
export const createBatchRequestBody = (batchId, sequence, src, urlbase) => {
  let n = 1
  const changeId = uuidv4()
  let body = batchStart(batchId, changeId)

  const queryResults = sequence.map(s => {
    try {
      const obj = model[s]
      const header = headerBuilder(obj, n++, urlbase)
      const payload = objectBuilder(obj.targetFields, src)
      Object.entries(obj.relationships || []).forEach(([name, obj]) =>
        Object.assign(payload, relationshipBuilder(name, obj, sequence)))
      return `${changeSetStart(changeId)}${header}${JSON.stringify(payload, null, 4)}`
    } catch (error) {
      const msg = `Translation error for, model: ${s} and data: \n${JSON.stringify(src, null, 4)}`
      console.error(msg, error)
      throw new UnrecoverableError(msg)
    }
  })

  body = body.concat(queryResults.join('\n'))
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
 * Create a key object from the response
 */
export const createKeyObject = (responseBody, sequence, baseUrl) => {
  const strippedResponseBody = responseBody.replaceAll(baseUrl, '')
  const searchResponse = id => strippedResponseBody.match(preComplied[id - 1]).groups
  return sequence.reduce((p, c) => ({ ...p, [c]: searchResponse(sequence.findIndex(s => s === c) + 1) }), {})
}
