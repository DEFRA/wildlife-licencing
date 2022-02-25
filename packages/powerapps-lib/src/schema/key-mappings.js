export class BaseKeyMapping {
  static copy (obj) {
    if (obj) {
      const mapping = new BaseKeyMapping()
      Object.assign(mapping, obj)
      return mapping
    }
    return null
  }

  constructor (apiTable, apiKey, apiBasePath, powerAppsTable, contentId, powerAppsKey) {
    this.apiTable = apiTable
    this.apiKey = apiKey
    this.apiBasePath = apiBasePath
    this.powerAppsTable = powerAppsTable
    this.contentId = contentId
    this.powerAppsKey = powerAppsKey
  }
}
