import * as _set from 'lodash.set'
import * as _get from 'lodash.get'

const { default: set } = _set
const { default: get } = _get

/**
 * Traverse a model node and build the power apps payload
 * @param fields - The set of fields on the model object being processed
 * @param src - The source json (from the application table in postgres)
 * @param obj - Do not set
 * @returns {{}} - The built object payload
 */
export const powerAppsObjectBuilder = (fields, src, obj = {}) => {
  for (const field in fields) {
    if (fields[field].srcPath) {
      Object.assign(obj, { [field]: get(src, fields[field].srcPath) })
    } else {
      const f = {}
      Object.assign(obj, { [field]: f })
      powerAppsObjectBuilder(fields[field], src, f)
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
 */
export const localObjectBuilder = (node, paObj, obj = {}, keys = {}) => {
  try {
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
      const value = get(paObj, field)
      set(obj, node[nodeName].targetFields[field].srcPath, value)
    }

    for (const next in node[nodeName]?.relationships) {
      const nn = node[nodeName].relationships[next]
      const key = nn.fk.replace('@odata.bind', '')
      localObjectBuilder({ [next]: nn }, paObj[key], obj, keys)
    }

    return { data: obj, keys }
  } catch (error) {
    console.error('Error processing extract data: ' + JSON.stringify(paObj))
    return null
  }
}
