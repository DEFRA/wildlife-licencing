import * as _set from 'lodash.set'
import * as _get from 'lodash.get'
import * as _has from 'lodash.has'

const { default: set } = _set
const { default: get } = _get
const { default: has } = _has

/**
 * Loop over a single model node and build the power apps payload
 * @param fields - The set of fields on the model object being processed e.g. model.<entity>.targetFields
 * @param src - The source json (from the application table in postgres)
 * @param obj - Do not set
 * @returns {{}} - The built object payload
 */
export const powerAppsObjectBuilder = (fields, src, obj = {}) => {
  for (const field in fields) {
    if (fields[field].srcFunc) {
      Object.assign(obj, { [field]: fields[field].srcFunc(src) })
    } else if (fields[field].srcPath) {
      Object.assign(obj, { [field]: get(src, fields[field].srcPath) })
    }
  }
  return obj
}

/**
 * Traverse the model and build an API payload from the powerapps data
 * @param node - A model node
 * @param paObj - The powerapps data as a JSON object
 * @param obj - Do not set
 * @param keys - Do not set
 * @returns {{}} - The built object
 *
 * Logs an error and returns null if an field is not found on the extracted object
 */
export const localObjectBuilder = (node, paObj, obj = {}, keys = {}) => {
  const nodeName = Object.keys(node)[0]
  const nodeKey = paObj[node[nodeName].targetKey]
  Object.assign(keys, {
    [nodeName]: {
      eid: nodeKey,
      entity: node[nodeName].targetEntity,
      ...paObj['@odata.etag'] ? { etag: paObj['@odata.etag'] } : {}
    }
  })

  for (const field in node[nodeName].targetFields) {
    if (has(paObj, field)) {
      if (node[nodeName].targetFields[field].tgtFunc) {
        const res = node[nodeName].targetFields[field].tgtFunc(paObj)
        res.forEach(r => set(obj, r.srcPath, r.value))
      } else if (node[nodeName].targetFields[field].srcPath) { // Ignore write only
        const value = get(paObj, field)
        set(obj, node[nodeName].targetFields[field].srcPath, value)
      }
    } else {
      console.error(`Field: ${field} not found in data: ${JSON.stringify(paObj)}`)
      throw new Error('Error building local object')
    }
  }

  for (const next in node[nodeName]?.relationships) {
    const nn = node[nodeName].relationships[next]
    const key = nn.fk.replace('@odata.bind', '')
    if (paObj[key]) {
      localObjectBuilder({ [next]: nn }, paObj[key], obj, keys)
    }
  }

  return { data: obj, keys }
}
