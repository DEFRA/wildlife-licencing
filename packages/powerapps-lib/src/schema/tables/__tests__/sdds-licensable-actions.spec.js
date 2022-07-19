import { SddsLicensableActions } from '../sdds-licensable-actions.js'

describe('The SddsLicensableActions table', () => {
  it('method source function joins an array', () => {
    const methodColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_method')
    expect(methodColumn.srcFunc([123, 456])).toEqual('123,456')
  })
  it('method target function splits a string', () => {
    const methodColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_method')
    expect(methodColumn.tgtFunc('123,456')).toEqual([123, 456])
  })
  it('method target function returns null given null', () => {
    const methodColumn = SddsLicensableActions.columns.find(c => c.name === 'sdds_method')
    expect(methodColumn.tgtFunc(null)).toBeNull()
  })
})
