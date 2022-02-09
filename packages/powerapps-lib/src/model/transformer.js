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
 * @returns {Promise<{}>}
 *
 * Unset values are treated as nulls and will therefore clear any previously set data in the
 * data-verse.
 *
 * Does not add an unbound field, i.e a relationship that cannot be evaluated.
 * Doing so fails the update, which is fine in as general a bad request should fail, but in the
 * specific case where reference data on the back-end is erroneously changed
 * there is then no way to clear the error without modifying the database and so it is better
 * to let these through. They can then be repaired on the back end. A warning is logged
 */
export const powerAppsObjectBuilder = async (fields, src, obj = {}) => {
  for (const field in fields) {
    if (fields[field].srcFunc) {
      await powerAppsObjectBuildByFieldFunction(fields, field, src, obj)
    } else if (fields[field].srcPath) {
      if (!powerAppsObjectBuilderByField(fields, field, src, obj)) {
        return null
      }
    }
  }
  return obj
}

async function powerAppsObjectBuildByFieldFunction (fields, field, src, obj) {
  if (fields[field].bind) {
    const id = await fields[field].srcFunc(src)
    if (id) {
      const data = `/${fields[field].bind}(${id})`
      Object.assign(obj, { [`${field}@odata.bind`]: data })
    } else {
      console.log(`WARNING: expected bound relation not found: ${fields[field].bind}`)
    }
  } else {
    const val = await fields[field].srcFunc(src)
    Object.assign(obj, { [field]: val || null })
  }
}

function powerAppsObjectBuilderByField (fields, field, src, obj) {
  if (fields[field].bind) {
    const id = get(src, fields[field].srcPath)
    if (id) {
      const data = `/${fields[field].bind}(${id})`
      Object.assign(obj, { [`${field}@odata.bind`]: data })
    } else {
      console.log(`WARNING: expected bound relation not found: ${fields[field].bind}`)
    }
  } else {
    const value = get(src, fields[field].srcPath)
    // If the value is null then;
    // (a) If we have the field marked as a trigger then return false
    //     the entity update will the omitted from the batch.
    // (b) Otherwise continue, the entity value is set to null
    if (!value) {
      if (fields[field].entityTrigger) {
        return false
      } else {
        Object.assign(obj, { [field]: null })
      }
    } else {
      Object.assign(obj, { [field]: value })
    }
  }
  // Return true if no entity trigger found
  return true
}

/**
 * Traverse the model and build an API payload and KEYS object from the powerapps data
 * @param node - A model node
 * @param paObj - The powerapps data as a JSON object
 * @param obj - Do not set
 * @param keys - Do not set
 * @returns {Promise<{}>} - The built object
 */
export const apiObjectBuilder = async (node, paObj, obj = {}, keys = {}) => {
  const nodeName = Object.keys(node)[0]
  const nodeKey = paObj[node[nodeName].targetKey]

  // Assign the PowerApps key details for the current model node to the keys object
  Object.assign(keys, {
    [nodeName]: {
      eid: nodeKey,
      entity: node[nodeName].targetEntity,
      ...paObj['@odata.etag'] ? { etag: paObj['@odata.etag'] } : {}
    }
  })

  // Process each field on the current model node target function
  // Each field is either a a path extract or a function
  for (const field in node[nodeName].targetFields) {
    if (has(paObj, field)) {
      if (node[nodeName].targetFields[field].tgtFunc) {
        await apiObjectBuilderFieldByFunction(node, nodeName, field, paObj, obj)
      } else if (node[nodeName].targetFields[field].srcPath) {
        apiObjectBuilderFieldByPath(paObj, field, obj, node, nodeName)
      }
    } else {
      // If we have do not have a required field and value then return null
      // Which filters out the item in the read stream
      // Otherwise the field is ignored
      if (node[nodeName].targetFields[field].required) {
        return null
      }
    }
  }

  // Step in the child nodes of the model
  await apiObjectBuilderTraverse(node, nodeName, paObj, obj, keys)

  return { data: obj, keys }
}

function apiObjectBuilderFieldByPath (paObj, field, obj, node, nodeName) {
  // Null values are not written, they are left undefined
  const value = get(paObj, field)
  if (value) {
    set(obj, node[nodeName].targetFields[field].srcPath, value)
  }
}

async function apiObjectBuilderFieldByFunction (node, nodeName, field, paObj, obj) {
  const res = await node[nodeName].targetFields[field].tgtFunc(paObj)
  res.forEach(r => set(obj, r.srcPath, r.value))
}

async function apiObjectBuilderTraverse (node, nodeName, paObj, obj, keys) {
  for (const next in node[nodeName]?.relationships) {
    const nn = node[nodeName].relationships[next]
    const key = nn.fk.replace('@odata.bind', '')
    if (paObj[key]) {
      await apiObjectBuilder({ [next]: nn }, paObj[key], obj, keys)
    }
  }
}

/**
 * Get the salient information from the options sets metadata
 * null if we don't want the option set
 * @param obj
 * @returns {*}
 */
export const globalOptionSetTransformer = obj => {
  return obj.Name && obj.Options && obj.Options.length > 0
    ? {
        name: obj.Name,
        values: obj.Options.map(s => ({
          value: s.Value,
          description: s.Label.UserLocalizedLabel.Label
        }))
      }
    : null
}
