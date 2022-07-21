import { Table } from '../schema.js'

describe('The table object', () => {
  it('has a correct copy-constructor', () => {
    const table = new Table('name', ['rel'],
      'basePath', 'apiTable', 'keyname')
    const copy = Table.copy(table)
    expect(copy).toEqual(table)
  })

  it('returns null on copy null', () => {
    const copy = Table.copy(null)
    expect(copy).toBeNull()
  })

  it('the relationships function will replace the columns with the pk column ', () => {
    const table = new Table('name', ['rel'],
      ['1'], 'basePath', 'apiTable', 'keyname')
    const relations = Table.relations(table)
    expect(relations).toEqual({
      apiTable: 'apiTable',
      basePath: 'basePath',
      columns: [
        {
          filterFunc: null,
          name: 'keyname',
          operationType: 'inbound-and-outbound'
        }
      ],
      keyName: 'keyname',
      name: 'name',
      relationships: [
        '1'
      ]
    })
  })

  it('the relationships function returns null given null', () => {
    const relations = Table.relations(null)
    expect(relations).toBeNull()
  })
})
