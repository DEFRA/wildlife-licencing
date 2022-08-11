// import { models } from '@defra/wls-database-model'
// import * as pkg from 'object-hash'
// const hash = pkg.default

export const writeLicenceObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    // console.log(JSON.stringify({ data, keys }, null, 4))
    return counter
  } catch (error) {
    console.error('Error updating LICENCES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
