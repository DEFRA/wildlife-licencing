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
  constructor (name, srcPath, srcFunc, operationType = OperationType.INBOUND_AND_OUTBOUND) {
    this.name = name
    this.srcPath = srcPath
    this.srcFunc = srcFunc
    this.operationType = operationType
  }
}

export const RelationshipType = Object.freeze({
  MANY_TO_ONE: 'many-to-one',
  ONE_TO_MANY: 'one-to-many',
  MANY_TO_MANY: 'many-to-many'
})

export class Relationship {
  constructor (name, relatedTable, type, lookupColumnName, srcPath, srcFunc, tgtFunc) {
    this.name = name
    this.relatedTable = relatedTable
    this.type = type
    this.lookupColumnName = lookupColumnName
    this.srcPath = srcPath
    this.srcFunc = srcFunc
    this.tgtFunc = tgtFunc
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
}
