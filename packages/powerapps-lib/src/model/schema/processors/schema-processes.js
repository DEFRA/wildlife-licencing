import { RelationshipType } from '../schema.js'

import * as _get from 'lodash.get'
import * as _set from 'lodash.set'
import * as _cloneDeep from 'lodash.clonedeep'
import { BaseKeyMapping } from '../key-mappings.js'

const { default: set } = _set
const { default: get } = _get
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
 * @param sequence - do not set
 * @param path - do not set
 * @returns {*[]}  - The sequence of table entities to operate on
 */
export const createTableSet = (table, include, sequence = [], path = table.basePath, relationshipName) => {
  if (table.relationships && table.relationships.length) {
    for (const relationship of table.relationships) {
      const child = include.find(i => i.name === relationship.relatedTable)
      if (child) {
        createTableSet(
          child,
          include,
          sequence,
          `${path}.${relationship.srcPath}`,
          relationship.name)
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

/**
 * For a given table and API src data generate the set of objects which will later be rendered to
 * the update text.
 *
 * It handles the function fields and can process array data where it appears in the srcObj
 * @param table - the table to action
 * @param srcObj - The API src object
 * @returns {Promise<*[]|null>}
 */
export const createTableColumnsPayload = async (table, srcObj, tableSet) => {
  const result = []
  const base = get(srcObj, `${table.basePath}`)
  // If its an array create each item in turn at the clone depth
  if (Array.isArray(base)) {
    for (const item of base) {
      const tempObj = {}
      set(tempObj, table.basePath, item)
      const c = await createTableColumnsPayloadInner(table, tempObj, tableSet)
      if (c) {
        result.push(c)
      }
    }
    return result
  } else {
    return createTableColumnsPayloadInner(table, srcObj, tableSet)
  }
}

const createTableColumnsPayloadInner = async (table, srcObj, tableSet) => {
  const columnPayload = { }

  // Look for the API id in the payload to associate with the contentId
  const id = get(srcObj, `${table.basePath}.id`)
  for (const column of table.columns) {
    const param = get(srcObj, `${table.basePath}.${column.srcPath}`)
    let value
    if (column.srcFunc) {
      if (column.srcPath) { // Expecting a parameter
        value = param ? await column.srcFunc(param) : null
      } else {
        value = await column.srcFunc()
      }
    } else {
      value = param
    }
    // If the value is null then;
    // (a) If we have the field marked as a required do not set
    // (b) Otherwise continue, the entity value is set to null
    if (!value) {
      if (!column.required) {
        Object.assign(columnPayload, { [column.name]: null })
      }
    } else {
      Object.assign(columnPayload, { [column.name]: value })
    }
  }

  // Check all the required columns are set otherwise this update goes no further
  if (!Object.entries(columnPayload).filter(([k]) => table.requiredColumns.find(rq => rq === k)).every(([, v]) => v)) {
    return null
  }

  const relationshipsPayload = await createTableRelationshipsPayload(table, srcObj, tableSet)

  return { id, columnPayload, relationshipsPayload }
}

const createTableRelationshipsPayload = async (table, srcObj, tableSet) => {
  const result = { }

  if (!table.relationships) {
    return null
  }

  // The set of relationships in the target table set which relates to another table in the table set
  const relationshipSet = table.relationships
    .filter(r => tableSet.map(t2 => t2.name).includes(r.relatedTable))
    .map(r => r.name)

  for (const relationship of table.relationships) {
    if (relationship.type === RelationshipType.MANY_TO_ONE) {
      // If the relationship is found in our table set, attempt to bind the value
      if (relationshipSet.includes(relationship.name)) {
        // The value will be replaced by the content index in the final parse
        // e.g. "sdds_applicantid@odata.bind": "sdds_application_applicantid_Contact", --> "sdds_applicantid@odata.bind": "$1",
        Object.assign(result, { [`${relationship.lookupColumnName}@odata.bind`]: relationship.name })
      } else {
        // This is data not included in the batch update (reference data) apply the function and bind
        // e.g. "sdds_applicationtypesid@odata.bind": "/sdds_applicationtypeses(a76057b1-027a-ec11-8d21-000d3a8748ed)",
        let value
        const param = get(srcObj, `${table.basePath}.${relationship.srcPath}`)
        if (relationship.srcFunc) {
          if (relationship.srcPath) { // Expecting a parameter
            value = param ? await relationship.srcFunc(param) : null
          } else {
            value = await relationship.srcFunc()
          }
        } else {
          value = param
        }
        Object.assign(result, { [`${relationship.lookupColumnName}@odata.bind`]: `/${relationship.relatedTable}(${value})` })
      }
    }
  }

  return result
}

const createTableMMRelationshipsPayloads = async (table, tableSet, srcObj, updateObjects) => {
  const result = []

  if (!table.relationships) {
    return null
  }

  const m2mRelationships = table.relationships
    .filter(r => r.type === RelationshipType.MANY_TO_MANY)

  if (!m2mRelationships.length) {
    return null
  }

  for (const relationship of m2mRelationships) {
    // Only set up where the target is in the update
    const r = updateObjects.filter(u => u.relationshipName === relationship.name)
    // Assignments requires a non-valid JS object (repeating keys)
    // The result is therefore a string (which is not invariant under stringify)
    result.push({
      name: relationship.name,
      assignments: '{\n' + r.map(r => `  "@odata.id": "$${r.contentId}"`).join(',\n') + '\n}'
    })
  }

  return result
}

/**
 * Helper function to replace the relationships with there positional parameter ContentId in
 * createBatchRequestObjects
 * @param tableRelationshipsPayload
 * @param updateObjects
 * @returns {{}|null}
 */
const substitutePlaceholders = (tableRelationshipsPayload, updateObjects, tableRelationships) => {
  if (tableRelationshipsPayload) {
    const substituted = Object.entries(tableRelationshipsPayload)
      .filter(([k, v]) => updateObjects.find(u => u.relationshipName === v))
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

function updateTargetKeys (targetKeys, tableColumnsPayloads, contentId, table) {
  const key = targetKeys.find(tk => tk.apiKey === tableColumnsPayloads?.id) ||
    targetKeys.find(tk => tk.apiBasePath === table.basePath)

  if (key) {
    key.powerAppsTable = table.name
    key.contentId = contentId
    key.apiBasePath = table.basePath
    return key.powerAppsKey
  } else {
    targetKeys.push(new BaseKeyMapping(table.apiTable, null, table.basePath, table.name, contentId))
    return null
  }
}

/**
 * Generates a set of objects to enable the subsequent generation of
 * the batch update payload text. Wraps and processes the results of the
 * createTableColumnsPayload and createTableRelationshipsPayload process
 * @param srcObj
 * @param tableSet
 * @returns {Promise<void>}
 */
export const createBatchRequestObjects = async (srcObj, targetKeys, tableSet) => {
  const updateObjects = []
  let contentId = 1 // Incremented after each push into updateObjects
  // Iterate over the table-set and gather the inline assignments of fields and relationships
  for (const table of tableSet) {
    const currentContentId = contentId
    const tableColumnsPayloads = await createTableColumnsPayload(table, srcObj, tableSet)
    if (tableColumnsPayloads) {
      if (Array.isArray(tableColumnsPayloads)) {
        for (const tableColumnsPayload of tableColumnsPayloads) {
          const powerAppsId = updateTargetKeys(targetKeys, tableColumnsPayload, contentId, table)
          updateObjects.push({
            table: table.name,
            relationshipName: table.relationshipName,
            contentId: contentId,
            assignments: Object.assign(tableColumnsPayload.columnPayload,
              substitutePlaceholders(tableColumnsPayload.relationshipsPayload, updateObjects, table.relationships)),
            powerAppsId,
            method: powerAppsId ? Methods.PATCH : Methods.POST
          })
          contentId++
        }
      } else {
        const powerAppsId = updateTargetKeys(targetKeys, tableColumnsPayloads, contentId, table)
        updateObjects.push({
          table: table.name,
          relationshipName: table.relationshipName,
          contentId: contentId,
          assignments: Object.assign(tableColumnsPayloads.columnPayload,
            substitutePlaceholders(tableColumnsPayloads.relationshipsPayload, updateObjects, table.relationships)),
          powerAppsId,
          method: powerAppsId ? Methods.PATCH : Methods.POST
        })
        contentId++
      }
    }

    // Handle m2m relationships. These are a separate request occurring after the containing
    // (driving) table request
    const tableM2MRelationshipsPayloads = await createTableMMRelationshipsPayloads(table, tableSet, srcObj, updateObjects)
    if (tableM2MRelationshipsPayloads) {
      for (const m of tableM2MRelationshipsPayloads) {
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
  }

  return updateObjects.map(u => ({
    contentId: u.contentId,
    table: u.table,
    assignments: u.assignments,
    method: u.method,
    powerAppsId: u.powerAppsId
  }))
}
