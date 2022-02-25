import { BaseKeyMapping } from '../key-mappings.js'

describe('The base key mapping object', () => {
  it('has a correct copy-constructor', () => {
    const baseKeyMapping = new BaseKeyMapping('apiTable', 'apiKey',
      'apiBasePath', 'powerAppsTable', 'contentId', 'powerAppsKey')
    const copy = BaseKeyMapping.copy(baseKeyMapping)
    expect(copy).toEqual(baseKeyMapping)
  })

  it('returns null on copy null', () => {
    const copy = BaseKeyMapping.copy(null)
    expect(copy).toBeNull()
  })
})
