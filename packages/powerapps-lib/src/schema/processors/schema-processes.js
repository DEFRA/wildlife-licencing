import { RelationshipType, OperationType } from '../schema.js'

import * as _get from 'lodash.get'
import * as _set from 'lodash.set'
import * as _has from 'lodash.has'
import * as _cloneDeep from 'lodash.clonedeep'
import { BaseKeyMapping } from '../key-mappings.js'

const { default: set } = _set
const { default: get } = _get
const { default: has } = _has
const { default: cloneDeep } = _cloneDeep

export const Methods = Object.freeze({
  GET: 'GET',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
})

/**
 * Create a set of tables based on the fixed table definitions and the relationships
 * (1) Determines the correct sequence of requests for the atomic batch update.
 * (2) Decorates each table instance with a calculated srcPath which maps into the API src object
 *
 * This is expected to run at startup and will not change at runtime.
 *
 * @param table - The table to start the search at
 * @param include - The set of tables to be searched
 * @param path - do not set
 * @param relationshipName
 * @param sequence - do not set
 * @returns {*[]}  - The sequence of table entities to operate on
 */
export const createTableSet = (table, include = [], path = table.basePath, relationshipName = null, sequence = []) => {
  if (table.relationships && table.relationships.length) {
    for (const relationship of table.relationships) {
      const child = include.find(i => i.name === relationship.relatedTable)
      if (child) {
        createTableSet(child, include, `${path}.${relationship.srcPath}`, relationship.name, sequence)
      }
    }
  }
  // Create a new table object
  const newTable = cloneDeep(table)
  newTable.basePath = path
  newTable.relationshipName = relationshipName
  sequence.push(newTable)
  return sequence
}

/******************************************************************************************
 * The following methods are concerned with OUTBOUND data AWS->PowerApps
 ******************************************************************************************/

/**
 * For a given table and API src data, generate the set of objects which will later be rendered to
 * the update text.
 * This iterates through the sequence of tables, in the calculated update order and in turn calls
 * the following outputs
 * { id, columnPayload, relationshipsPayload, keyOnlyRelations }
 * (1) id - the primary (API) key of the record
 * (2) columnPayload - the column values
 * (3) relationshipsPayload - the M:1 relationships either included in the update and referenced by the contentId
 * or using a bind relationship, in a single-ended update i.e. to reference-data
 * (4) keyOnlyRelations - 1:M and M:M relations which are bound (i.e. single-ended, i.e. bound to reference data and not included
 * in the update)
 * @param table
 * @param srcObj
 * @param tableSet
 * @returns {Promise<{relationshipsPayload: null|{}, id: *, keyOnlyRelations: null|*[], columnPayload: {}}|null|*[]>}
 **/
export const createTablePayload = async (table, srcObj, tableSet) => {
  const result = []

  // Omit the payload if the base path is not set
  if (!has(srcObj, table.basePath)) {
    return null
  }

  const base = get(srcObj, table.basePath)
  // If it's an array create each item in turn at the clone depth
  if (Array.isArray(base)) {
    for (const item of base) {
      const tempObj = {}
      set(tempObj, table.basePath, item)
      const c = await createTablePayloadInner(table, tempObj, tableSet)
      if (c) {
        result.push(c)
      }
    }
    return result
  } else {
    return createTablePayloadInner(table, srcObj, tableSet)
  }
}

const createTablePayloadInner = async (table, srcObj, tableSet) => {
  const columnPayload = { }

  // Look for the API id in the payload to associate with the contentId
  const id = get(srcObj, `${table.basePath}.keys.apiKey`)
  for (const column of table.columns) {
    if (OperationType.outbound(column.operationType)) {
      // If the path is not set then it is (only) possible to run the function un-parametrized
      if (column.srcFunc && !column.srcPath) {
        Object.assign(columnPayload, { [column.name]: await column.srcFunc() })
      } else if (has(srcObj, `${table.basePath}.data.${column.srcPath}`)) {
        // If the path is set then set the column directly or via the function
        // This may set null (where allowed by the Open API spec or given by the source function)
        const param = get(srcObj, `${table.basePath}.data.${column.srcPath}`)
        Object.assign(columnPayload, { [column.name]: column.srcFunc ? await column.srcFunc(param) : param })
      }
    }
  }

  const relationshipsPayload = await createTableRelationshipsPayload(table, srcObj, tableSet)
  const keyOnlyRelations = createTableRelationsForSingleEnded(table, srcObj)
  return { id, columnPayload, relationshipsPayload, keyOnlyRelations }
}

const createTableRelationsForSingleEnded = (table, srcObj) => {
  const result = []

  if (!table.relationships) {
    return null
  }

  const relationshipSet = table.relationships
    .filter(r => r.type === RelationshipType.MANY_TO_MANY || r.type === RelationshipType.ONE_TO_MANY)
    .filter(r => OperationType.outbound(r.operationType))
    .filter(r => r.singleEnded)

  for (const relationship of relationshipSet) {
    // These are used to create 1:M and M:M relationships-only where the keys are from the payload. i.e.
    const param = get(srcObj, `${table.basePath}.${relationship.srcPath}`)
    result.push({
      name: relationship.name,
      table: table.name,
      relatedTable: relationship.relatedTable,
      sddsKeys: param.map(p => p.keys.sddsKey)
    })
  }

  return result
}

const createTableRelationshipsPayload = async (table, srcObj, tableSet) => {
  const result = {}

  if (!table.relationships) {
    return null
  }

  // Get the set of M:1 outbound relationships for the current table
  const relationshipSet = table.relationships
    .filter(r => OperationType.outbound(r.operationType))
    .filter(r => r.type === RelationshipType.MANY_TO_ONE)

  // Iterate the relationships
  for (const relationship of relationshipSet) {
    // If the related table is found in the table set, attempt to bind the value
    if (tableSet.map(t => t.name).includes(relationship.relatedTable)) {
      // The value will be replaced by the content index in the final parse
      // e.g. "sdds_applicantid@odata.bind": "sdds_application_applicantid_Contact", --> "sdds_applicantid@odata.bind": "$1",
      Object.assign(result, { [`${relationship.lookupColumnName}@odata.bind`]: relationship.name })
    } else {
      // This is data not included in the batch update (reference data) apply the function and bind
      // e.g. "sdds_applicationtypesid@odata.bind": "/sdds_applicationtypeses(a76057b1-027a-ec11-8d21-000d3a8748ed)",
      await createTableReferenceRelations(srcObj, table, relationship, result)
    }
  }

  return result
}

const createTableReferenceRelations = async (srcObj, table, relationship, result) => {
  let value
  const param = get(srcObj, `${table.basePath}.data.${relationship.srcPath}`)
  if (relationship.srcFunc) {
    if (relationship.srcPath) { // Expecting a parameter
      value = param ? await relationship.srcFunc(param) : null
    } else {
      value = await relationship.srcFunc()
    }
  } else {
    value = param
  }
  // If there is no value this is ignored
  if (value) {
    Object.assign(result, { [`${relationship.lookupColumnName}@odata.bind`]: `/${relationship.relatedTable}(${value})` })
  }
}

/**
 * Generate the update objects for the one-to-many and the many-to-many relationships on any
 * given table in the set
 * @param table - The table
 * @param updateObjects - The set of update objects being built
 * @returns <null|*[]>
 */
export const createMultiRelations = (table, updateObjects) => {
  const result = []

  if (!table.relationships) {
    return null
  }

  const relationships = table.relationships
    .filter(r => r.type === RelationshipType.MANY_TO_MANY || r.type === RelationshipType.ONE_TO_MANY)
    .filter(r => OperationType.outbound(r.operationType))
    .filter(r => !r.singleEnded)

  if (!relationships.length) {
    return null
  }

  for (const relationship of relationships) {
    // Only set up where the target is in the update
    const rel = updateObjects.filter(u => u.relationshipName === relationship.name)
    if (rel.length) {
      rel.forEach(r => result.push({
        name: relationship.name,
        assignments: { '@odata.id': `$${r.contentId}` }
      }))
    }
  }

  return result
}

/**
 * Helper function to replace the relationships with their positional parameter ContentId in
 * createBatchRequestObjects
 * @param tableRelationshipsPayload
 * @param updateObjects
 * @param tableRelationships
 * @returns {{}|null}
 */
const substitutePlaceholders = (tableRelationshipsPayload, updateObjects, tableRelationships) => {
  if (tableRelationshipsPayload) {
    const substituted = Object.entries(tableRelationshipsPayload)
      .filter(([, v]) => updateObjects.find(u => u.relationshipName === v))
      .map(([k, v]) => ({ [k]: `$${updateObjects.find(u => u.relationshipName === v).contentId}` }))
      .reduce((p, c) => Object.assign(p, c), {})

    const binds = Object.entries(tableRelationshipsPayload)
      .filter(([, v]) => !tableRelationships.find(r => r.name === v))
      .map(([k, v]) => ({ [k]: v }))
      .reduce((p, c) => Object.assign(p, c), {})

    return Object.assign(binds, substituted)
  }

  return { }
}

/**
 * Locate the sddsKey from within the payload or null
 * @param payload
 * @param tableColumnsPayloads
 * @param table
 * @returns {null|string|*}
 */
const getKeys = (payload, tableColumnsPayloads, table) => {
  const item = get(payload, table.basePath)
  if (item) {
    return Array.isArray(item) ? item.find(i => i.keys.apiKey === tableColumnsPayloads.id).keys : item.keys
  }
  return null
}

const assignColumns = (payload, tableColumnsPayload, contentId, table, updateObjects) => {
  if (Object.keys(tableColumnsPayload.columnPayload).length) {
    // Decorate the target keys object with the contentId
    const keys = getKeys(payload, tableColumnsPayload, table)
    updateObjects.push({
      table: table.name,
      apiTable: table.apiTable,
      apiKey: keys.apiKey,
      relationshipName: table.relationshipName,
      contentId: contentId,
      assignments: Object.assign(tableColumnsPayload.columnPayload,
        substitutePlaceholders(tableColumnsPayload.relationshipsPayload, updateObjects, table.relationships)),
      powerAppsId: keys?.sddsKey,
      method: keys?.sddsKey ? Methods.PATCH : Methods.POST
    })
    contentId++
  }
  return contentId
}

export const fetchTableRelationshipsSingleEnded = (table, tableColumnsPayload) => {
  const result = []
  if (!table.relationships) {
    return null
  }

  const relationships = table.relationships
    .filter(r => r.type === RelationshipType.MANY_TO_MANY || r.type === RelationshipType.ONE_TO_MANY)
    .filter(r => OperationType.outbound(r.operationType))
    .filter(r => r.singleEnded)

  if (!relationships.length) {
    return null
  }

  if (tableColumnsPayload && tableColumnsPayload.keyOnlyRelations.length) {
    tableColumnsPayload.keyOnlyRelations.forEach(keyOnlyRelation => {
      for (const sddsKey of keyOnlyRelation.sddsKeys) {
        result.push({
          name: keyOnlyRelation.name,
          assignments: {
            '@odata.id': `__URL__/${keyOnlyRelation.relatedTable}(${sddsKey})`
          }
        })
      }
    })
  }

  return result
}

/**
 * Appends to the update object the result of fetchTableRelationshipsSingleEnded and increments the contentId
 * @param tableColumnsPayload
 * @param contentId
 * @param table
 * @param updateObjects
 * @param refContentId
 * @returns {*}
 */
const assignSingleEndedRelations = (tableColumnsPayload, contentId, table, updateObjects, refContentId) => {
  const tableRelationshipsForKeyOnly = fetchTableRelationshipsSingleEnded(table, tableColumnsPayload)
  if (tableRelationshipsForKeyOnly && tableRelationshipsForKeyOnly.length) {
    for (const mko of tableRelationshipsForKeyOnly) {
      updateObjects.push({
        table: `$${refContentId}/${mko.name}/$ref`,
        contentId: contentId,
        assignments: mko.assignments,
        method: Methods.POST
      })
      contentId++
    }
  }

  return contentId
}

const assignMultiRelations = (table, updateObjects, currentContentId, contentId) => {
  const tableRelationshipsPayloads = createMultiRelations(table, updateObjects)
  if (tableRelationshipsPayloads && tableRelationshipsPayloads.length) {
    for (const m of tableRelationshipsPayloads) {
      updateObjects.push({
        table: `$${currentContentId}/${m.name}/$ref`,
        relationshipName: table.relationshipName,
        contentId: contentId,
        assignments: m.assignments,
        method: Methods.POST
      })
      contentId++
    }
  }
  return contentId
}

/**
 * The main entrypoint to generate the updateObjects array which holds the set of
 * operations that make up the sequential batch operation. The update object
 * contentId is the operation number.
 * This enables the subsequent generation of
 * the batch update payload text. Wraps and processes the results of a number of
 * nested operations which are applied in a specific sequence
 *
 * The relations are handled as follows:
 * Cardinality  Included (Bound)                  Not Included (Reference)
 * -----------  ----------------                  ------------------------
 * M:1          createTableRelationshipsPayload   createTableReferenceRelations
 * 1:M          createMultiRelations              createTableRelationsForSingleEnded
 * M:M          createMultiRelations              createTableRelationsForSingleEnded
 *
 * @param payload - The source data object
 * @param tableSet - The set of tables involved the update
 * @returns {Promise<*[]>} - the built update object
 */
export const createBatchRequestObjects = async (payload, tableSet) => {
  // Built as each table in the set is processed, contains all the field assignments
  // and relationship bindings as well as the target keys and request method
  const updateObjects = []
  let contentId = 1 // Incremented after each push into updateObjects
  // Iterate over the table-set
  for (const table of tableSet) {
    const currentContentId = contentId
    // Gathers the table columns, assignments and relationship bindings
    const tablePayload = await createTablePayload(table, payload, tableSet)
    // If required fields are not set then will have a null here and this table is omitted from the update
    if (tablePayload) {
      // In the case where a relationship is m2m this will be an array. e.g. sites
      if (Array.isArray(tablePayload)) {
        for (const tableColumnsPayload of tablePayload) {
          const refContentId = contentId
          contentId = assignColumns(payload, tableColumnsPayload, contentId, table, updateObjects)
          contentId = assignSingleEndedRelations(tableColumnsPayload, contentId, table, updateObjects, refContentId)
        }
      } else {
        const refContentId = contentId
        contentId = assignColumns(payload, tablePayload, contentId, table, updateObjects)
        contentId = assignSingleEndedRelations(tablePayload, contentId, table, updateObjects, refContentId)
      }
    }

    // Handle 1:M amd M:M relationships. These are a separate requests occurring after the containing
    // (driving) table request
    contentId = assignMultiRelations(table, updateObjects, currentContentId, contentId)
  }

  return updateObjects
}

/******************************************************************************************
 * The following methods are concerned with INBOUND data PowerApps->AWS
 ******************************************************************************************/
export const buildRequestPathRelationships = (table, include, path, delim) => {
  if (table.relationships && table.relationships.length) {
    for (const relationship of table.relationships) {
      // Check the relationship is inbound
      if (OperationType.inbound(relationship.operationType)) {
        // Filter the relationships by the tables included in the table set
        const nextTable = include.find(i => i.name === relationship.relatedTable)
        if (nextTable) {
          const navigationProperty = [RelationshipType.ONE_TO_MANY, RelationshipType.MANY_TO_MANY].includes(relationship.type)
            ? relationship.name
            : relationship.lookupColumnName
          if (relationship.keyOnly) {
            path += `${delim}${navigationProperty}($select=${nextTable.keyName})`
          } else {
            path += `${delim}${navigationProperty}(${buildRequestPath(nextTable, include, false, ';$expand=')})`
          }
          delim = ','
        }
      }
    }
  }
  return path
}

/**
 * Generate a multi-level request path based on a given table and set of included tables
 * with an atomic GET request to the ODATA interface
 * Write-only fields are ignored
 * TableName?$select=SelectList
 *   &$expand=Relationship.LookupColumnName($Select=SelectList;$expand...),
 *   &$expand=Relationship.LookupColumnName($Select=SelectList;$expand...)...
 */
export const buildRequestPath = (table, include = [], isFirst = true, delim = '&$expand=') => {
  let path = ''
  if (isFirst) {
    path += table.name
    path += '?' // Start the url query parameters
  }
  const cols = table.columns.filter(c => OperationType.inbound(c.operationType) && c.name)
  if (cols.length) {
    path += `$select=${cols.map(c => c.name).join(',')}`
  }

  /**
   * Function to determine the filter delimiter - which if in a nested table is delimited by ';'
   */
  const fDelim = (c, f) => {
    if (c.length === 0) {
      return ''
    } else if (f) {
      return '&'
    } else {
      return ';'
    }
  }

  const filters = table.columns.filter(c => OperationType.inbound(c.operationType) && c.filterFunc)

  if (filters.length) {
    path += `${fDelim(cols, isFirst)}$filter=${filters.map(c => c.filterFunc()).join(',')}`
  }

  path = buildRequestPathRelationships(table, include, path, delim)

  return path
}

function buildObjectTransformerColumn (column, src, value) {
  if (OperationType.inbound(column.operationType) && column.srcPath) {
    const val = column.tgtFunc ? column.tgtFunc(src[column?.name]) : src[column.name]
    if (val) {
      Object.assign(value, { [column.srcPath]: val })
    }
  }
}

const buildArrayObjectTransformer = (src, t, data) => {
  const values = []
  for (const s of src) {
    const value = {}
    for (const column of t.columns) {
      buildObjectTransformerColumn(column, s, value)
    }
    values.push(value)
  }
  set(data, `${t.basePath}`, values)
}

function buildObjectObjectTransformer (t, src, data) {
  for (const column of t.columns) {
    if (OperationType.inbound(column.operationType) && column.srcPath) {
      const value = column.tgtFunc ? column.tgtFunc(src[column?.name]) : src[column.name]
      // The inbound stream does not set null values
      if (value !== null && value !== undefined) {
        set(data, `${t.basePath}.${column.srcPath}`, value)
      }
    }
  }
}

async function updateRelationship (relationship, src, data, t, tableSet, objectTransformer, keys) {
  // Lookup relationships (with a tgtFunc) 1:M
  // Evaluate target functions on the relationships
  // And are not further traversed
  if (relationship.tgtFunc && src[relationship.lookupColumnName]) {
    const value = await relationship.tgtFunc(src[relationship.lookupColumnName])
    if (value) {
      set(data, `${t.basePath}.${relationship.srcPath}`, value)
    }
  } else {
    const nextTable = tableSet.find(ts => ts.relationshipName === relationship.name)
    const navigationProperty = [RelationshipType.ONE_TO_MANY, RelationshipType.MANY_TO_MANY].includes(relationship.type)
      ? relationship.name
      : relationship.lookupColumnName
    const nextSrc = src[navigationProperty]
    if (nextTable && nextSrc) {
      await objectTransformer(nextSrc, nextTable, data, keys)
    }
  }
}

const updateRelationships = async (t, src, data, tableSet, objectTransformer, keys) => {
  if (t.relationships && t.relationships.length) {
    for (const relationship of t.relationships) {
      await updateRelationship(relationship, src, data, t, tableSet, objectTransformer, keys)
    }
  }
}

/**
 * This function returns a function to transform the query results from a given table set
 * It produces a function which is processed in the read-stream to create data and keys objects
 * which conform to the API data specification
 * @param table
 * @param tableSet
 * @returns {function(*=, *=, *=, *=): {data: {}, keys: *[]}}
 */
export const buildObjectTransformer = (table, tableSet) => {
  const objectTransformerColumns = (t, src, data) => {
    if (Array.isArray(src)) {
      buildArrayObjectTransformer(src, t, data)
    } else {
      buildObjectObjectTransformer(t, src, data)
    }
  }

  const updateTransformerKeys = (t, src, keys) => {
    if (Array.isArray(src)) {
      for (const s of src) {
        keys.push(new BaseKeyMapping(t.apiTable, null, t.basePath, t.name, null, s[t.keyName]))
      }
    } else {
      keys.push(new BaseKeyMapping(t.apiTable, null, t.basePath, t.name, null, src[t.keyName]))
    }
  }

  const objectTransformer = async (src, t = table, data = {}, keys = []) => {
    // Map the object columns - no function lookups at the moment so sync
    objectTransformerColumns(t, src, data)
    // Add the key mapping to the key mapping set - the API key is not known yet
    updateTransformerKeys(t, src, keys)

    // Add the relationships assignments
    await updateRelationships(t, src, data, tableSet, objectTransformer, keys)

    // Return data and keys
    return { data, keys }
  }

  // Returns the function which is supplied to the stream
  return objectTransformer
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
