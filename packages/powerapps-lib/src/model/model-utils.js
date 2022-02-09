/**
 * Determine the sequence of requests to be made to the odata batch request
 *
 * Traverses the model and locates all the nodes starting
 * at the leaves and progressing towards the trunk. This is the order
 * that the entity operation ODATA queries will need to be run
 *
 * Write-only nodes are not followed
 * @param node - the start node of the model
 * @param sequence - the sequence - no not set
 * @returns {*[]} an array of the nodes in leaf-to-trunk order
 */
export const findRequestSequence = (node, sequence = []) => {
  for (const nodeName of Object.keys(node)) {
    if (!node[nodeName].relationships && !node[nodeName].multiValuedRelationships) {
      sequence.push(nodeName)
      return sequence
    }

    for (const r in node[nodeName].relationships) {
      if (!node[nodeName].relationships[r].readOnly) {
        findRequestSequence({ [r]: node[nodeName].relationships[r] }, sequence)
      }
    }

    sequence.push(nodeName)
  }

  return sequence
}

/**
 * Traverse the model and locate that part specified by the nodeName (obtained from sequence)
 * @param model - The model
 * @param nodeName - The name of the model node
 * @param node - Do not set
 */
export const getModelNode = (model, nodeName) => {
  let result = null
  for (const nn of Object.keys(model)) {
    // True when locating the top level node
    if (nn === nodeName) {
      return model[nn]
    }

    // True when locating child node
    // if (model === nodeName) {
    //   return model
    // }

    // True if found within recursion, step up
    if (result) {
      return result
    }

    result = null
    for (const r in model[nn].relationships) {
      result = getModelNode({ [r]: model[nn].relationships[r] }, nodeName)
      if (result) {
        return result
      }
    }
  }

  // Not found
  return null
  // return result
}

/**
 * Generate a multi-level request path based on a model to extract a set of model data
 * with a atomic GET request to the ODATA interface
 * Write-only fields are ignored
 * @param node - The start node of the model
 * @param delim - track the expand delimiter - don't set this
 * @returns {string} - The calculated path
 */
export const buildRequestPath = (node, isFirst = true, delim = '&$expand=') => {
  // Iterate over the model
  let path = ''
  const nodeName = Object.keys(node)[0]
  if (isFirst) {
    path += `${nodeName}?`
  }
  path += `$select=${Object.entries(node[nodeName].targetFields)
    .filter(f => !f[1].writeOnly).map(o => o[0]).join(',')}`
  for (const entity in node[nodeName]?.relationships) {
    const relNode = node[nodeName].relationships[entity]
    path += `${delim}${relNode.fk.replace('@odata.bind', '')}(${buildRequestPath({ [entity]: relNode }, false, ';$expand=')})`
    delim = ','
  }
  return path
}
