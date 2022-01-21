import { writeApplicationObject } from './write-application-object.js'

/**
 * Process the stream and pass each object to the handler writeApplicationObject
 * @param s - the readable stream to process
 * @param ts - the timestamp at the start of the extract
 * @returns {Promise<unknown>}
 */

const dbIterator = async (s, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  for await (const obj of s.iterator({ destroyOnReturn: true })) {
    const { insert, update, pending, error } = await writeApplicationObject(obj, ts)
    counter.insert += insert
    counter.update += update
    counter.pending += pending
    counter.error += error
  }
  return counter
}

export const applicationsDatabaseWriter = async (s, ts) => {
  console.log(`Extract start timestamp ${ts}`)

  // Run the async iterator to process the stream
  const counter = await dbIterator(s, ts)

  // Log the counters
  console.log(`Applications inserted: ${counter.insert}`)
  console.log(`Applications updated: ${counter.update}`)
  console.log(`Applications locked or pending: ${counter.pending}`)
  console.log(`Applications errored: ${counter.error}`)
}
