export class Column {
  constructor (name, srcPath, srcFunc, required = false) {
    this.name = name
    this.srcPath = srcPath
    this.srcFunc = srcFunc
    this.required = required
  }
}

export const RelationshipType = Object.freeze({
  MANY_TO_ONE: 'many-to-one',
  ONE_TO_MANY: 'one-to-many',
  MANY_TO_MANY: 'many-to-many'
})

export class Relationship {
  constructor (name, relatedTable, type, lookupColumnName, srcPath, srcFunc) {
    this.name = name
    this.relatedTable = relatedTable
    this.type = type
    this.lookupColumnName = lookupColumnName
    this.srcPath = srcPath
    this.srcFunc = srcFunc
  }
}

export class Table {
  constructor (
    name,
    columns = [],
    relationships = [],
    basePath,
    requiredColumns = [],
    apiTable
  ) {
    this.name = name
    this.columns = columns
    this.relationships = relationships
    this.basePath = basePath
    this.requiredColumns = requiredColumns
    this.apiTable = apiTable
  }
}
