export const buildRequestPath = (node, isFirst = true) => {
  // Iterate over the model
  let path = ''
  const nodeName = Object.keys(node)[0]
  if (isFirst) {
    path += `${nodeName}?`
  }
  path += `$select=${Object.keys(node[nodeName].targetFields).join(',')}`
  for (const entity in node[nodeName]?.relationships) {
    const relNode = node[nodeName].relationships[entity]
    const delim = isFirst ? '&' : ';'
    path += `${delim}$expand=${relNode.fk.replace('@odata.bind', '')}(${buildRequestPath({ [entity]: relNode }, false)})`
  }
  return path
}

/**
 * Builds a request from the model
 * Extract the applications from Power Apps
 * Apply the inverse transformation
 * return as a stream of of objects
 */
export const extractApplications = async () => {
  console.log(buildRequestPath())
  return null
}
