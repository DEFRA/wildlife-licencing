import jp from 'jsonpath'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { model } from '../model/sdds-model.js'

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

const headerBuilder = (obj, n, urlbase) => `POST ${urlbase}/${obj.targetEntity}\nContent-Type: application/http\nContent-Transfer-Encoding:binary\nContent-ID: ${n}\n\n`
const batchStart = (b, c) => `--batch_${b}\nContent-Type: multipart/mixed;\nboundary=changeset_${c}\n`
const changesetStart = c => `--changeset_${c}\n`
const changesetEnd = c => `--changeset_${c}--\n`
const batchEnd = b => `--batch_${b}--\n`

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

export const formQuery = (sequence, src, urlbase) => {
  let n = 1
  const batchId = crypto.randomBytes(3).toString('hex').toUpperCase()
  const changeId = uuidv4()
  let body = batchStart(batchId, changeId)

  const queryResults = sequence.map(s => {
    try {
      const obj = model[s]
      const header = headerBuilder(obj, n++, urlbase)
      const payload = objectBuilder(obj.targetFields, src)
      Object.entries(obj.relationships || []).forEach(([name, obj]) =>
        Object.assign(payload, relationshipBuilder(name, obj, sequence)))
      return `${changesetStart(changeId)}\n${header}\n${JSON.stringify(payload, null, 4)}\n${changesetEnd(changeId)}\n\n`
    } catch (error) {
      const msg = `Translation error for, model: ${s} and data: \n${JSON.stringify(src, null, 4)}`
      console.error(msg, error)
      throw new UnrecoverableError(msg)
    }
  })

  body = body.concat(queryResults.join('\n'))
  body = body.concat(batchEnd(batchId))

  return body
}
