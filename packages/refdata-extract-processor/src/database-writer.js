/**
 * Process the stream and pass each object to the handler writeApplicationObject
 * @param s - the readable stream to process
 * @param writeObject - The function to write to the database
 * @returns {Promise<unknown>}
 */

const dbIterator = async (s, writeObject) => {
  const counter = { update: 0 }
  for await (const obj of s.iterator({ destroyOnReturn: true })) {
    const { update } = await writeObject(obj)
    counter.update += update
  }
  return counter
}

export const databaseWriter = async (s, writeObject, desc) => {
  // Run the async iterator to process the stream
  const counter = await dbIterator(s, writeObject)

  // Log the counters
  console.log(`${desc}: updated: ${counter.update}`)
}
