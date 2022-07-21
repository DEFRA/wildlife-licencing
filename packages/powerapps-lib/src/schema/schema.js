import * as _cloneDeep from 'lodash.clonedeep'
const { default: cloneDeep } = _cloneDeep

// With respect to the API
const INBOUND_AND_OUTBOUND = 'inbound-and-outbound'
const INBOUND = 'inbound'
const OUTBOUND = 'outbound'
export const OperationType = Object.freeze({
  INBOUND,
  OUTBOUND,
  INBOUND_AND_OUTBOUND,
  inbound: ot => ot === INBOUND || ot === INBOUND_AND_OUTBOUND,
  outbound: ot => ot === OUTBOUND || ot === INBOUND_AND_OUTBOUND
})

export class Column {
  constructor (name, srcPath, srcFunc, tgtFunc,
    operationType = OperationType.INBOUND_AND_OUTBOUND, filterFunc = null) {
    this.name = name
    this.srcPath = srcPath
    this.srcFunc = srcFunc
    this.tgtFunc = tgtFunc
    this.operationType = operationType
    this.filterFunc = filterFunc
  }
}

export const RelationshipType = Object.freeze({
  MANY_TO_ONE: 'many-to-one',
  ONE_TO_MANY: 'one-to-many',
  MANY_TO_MANY: 'many-to-many'
})

export class Relationship {
  /**
   * Relationship constructor
   * @param name - The name given to the relationship in the power platform
   * @param relatedTable - The related power platform table name
   * @param type - The relationship cardinality
   * @param lookupColumnName - The column name in the owning table (not required for M:M)
   * @param srcPath - The path into the source structure
   * @param srcFunc - A function operating on the data at source path (OUTBOUND)
   * @param tgtFunc - A function operating on the data at source path (INBOUND)
   * @param operationType - dictate if the relation expanded on INBOUND, OUTBOUND or both operations
   * @param keyOnly - If the relation is expanded on the INBOUND operation then expand only the keys -
   * do not traverse. Ignored for the outbound operation
   */
  constructor (name, relatedTable, type, lookupColumnName, srcPath, srcFunc,
    tgtFunc, operationType = OperationType.INBOUND_AND_OUTBOUND, keyOnly = false) {
    this.name = name
    this.relatedTable = relatedTable
    this.type = type
    this.lookupColumnName = lookupColumnName
    this.srcPath = srcPath
    this.srcFunc = srcFunc
    this.tgtFunc = tgtFunc
    this.operationType = operationType
    this.keyOnly = keyOnly
  }
}

export class Table {
  constructor (
    name,
    columns = [],
    relationships = [],
    basePath,
    apiTable,
    keyName
  ) {
    this.name = name
    this.columns = columns
    this.relationships = relationships
    this.basePath = basePath
    this.apiTable = apiTable
    this.keyName = keyName
  }

  static copy (obj) {
    if (obj) {
      const mapping = new Table()
      Object.assign(mapping, cloneDeep(obj))
      return mapping
    }
    return null
  }

  /**
   * Helper function for where you want to extract relations. It replaces the columns with
   * just the primary key column
   * @param obj
   * @returns {Table|null}
   */
  static relations (obj) {
    if (obj) {
      const copy = new Table()
      Object.assign(copy, cloneDeep(obj))
      copy.columns = [
        new Column(copy.keyName)
      ]
      return copy
    }
    return null
  }
}
