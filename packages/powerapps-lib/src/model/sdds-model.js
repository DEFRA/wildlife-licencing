/* eslint-disable camelcase */
import { sddsApplications } from './sdds-applications.js'
import { applicant } from './applicant.js'
import { ecologist } from './ecologist.js'

export const model = { sdds_applications: sddsApplications, ecologist, applicant }

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
