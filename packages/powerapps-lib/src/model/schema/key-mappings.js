export class DependentKeyMapping {
  constructor (apiTable, powerAppsRelationship, powerAppsTable, powerAppsKey) {
    this.apiTable = apiTable
    this.powerAppsRelationship = powerAppsRelationship
    this.powerAppsTable = powerAppsTable
    this.powerAppsKey = powerAppsKey
  }
}

export class BaseKeyMapping {
  constructor (apiTable, apiKey, powerAppsTable, powerAppsKey = null, dependentKeyMappings = []) {
    this.dependentKeyMappings = dependentKeyMappings
    this.apiTable = apiTable
    this.apiKey = apiKey
    this.powerAppsKey = powerAppsKey
  }
}
