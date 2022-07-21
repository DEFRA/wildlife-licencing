import { Account } from '../account.js'

describe('The Account table', () => {
  it('method source-remote function returns true', () => {
    const methodColumn = Account.columns.find(c => c.name === 'sdds_sourceremote')
    expect(methodColumn.srcFunc()).toBeTruthy()
  })
  it('method source-remote filter function to return the filter string', () => {
    const methodColumn = Account.columns.find(c => c.name === 'sdds_sourceremote')
    expect(methodColumn.filterFunc()).toEqual('sdds_sourceremote eq true')
  })
})
