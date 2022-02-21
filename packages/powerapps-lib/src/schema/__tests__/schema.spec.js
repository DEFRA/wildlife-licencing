import { Table } from '../schema.js'

describe('The table object', () => {
  it('has a correct copy-constructor', () => {
    const table = new Table('name', ['rel'],
      'basePath', 'apiTable', 'keyname')
    const copy = Table.copy(table)
    expect(copy).toEqual(table)
  })
})
