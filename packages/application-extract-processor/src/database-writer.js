
/**
 * Process the stream and pass each object to the handler objectWriter
 * @param s - the readable stream to process
 * @param ts - the timestamp at the start of the extract
 * @param objectWriter - A function to write down a data object into the database
 * @returns {Promise<unknown>}
 */
const dbIterator = async (s, ts, objectWriter) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  for await (const obj of s.iterator({ destroyOnReturn: true })) {
    const { insert, update, pending, error } = await objectWriter(obj, ts)
    counter.insert += insert
    counter.update += update
    counter.pending += pending
    counter.error += error
  }
  return counter
}

export const databaseWriter = async (s, objectWriter, ts, name) => {
  console.log(`Extract start timestamp ${ts}`)

  // Run the async iterator to process the stream
  const counter = await dbIterator(s, ts, objectWriter)

  // Log the counters
  console.log(`${name} inserted: ${counter.insert}`)
  console.log(`${name} updated: ${counter.update}`)
  console.log(`${name} locked or pending: ${counter.pending}`)
  console.log(`${name} errored: ${counter.error}`)
}
