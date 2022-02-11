// With respect to the API
export const OperationType = Object.freeze({
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  INBOUND_AND_OUTBOUND: 'inbound-and-outbound',
  inbound: ot => ot === 'inbound' || ot === 'inbound-and-outbound',
  outbound: ot => ot === 'outbound' || ot === 'inbound-and-outbound'
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
    apiTable
  ) {
    this.name = name
    this.columns = columns
    this.relationships = relationships
    this.basePath = basePath
    this.apiTable = apiTable
  }

  static copy (obj) {
    if (obj) {
      const mapping = new Table()
      Object.assign(mapping, obj)
      return mapping
    }
    return null
  }
}
