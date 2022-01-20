const { Readable } = require('stream')

describe('The reference data extract processor: database-writer', () => {
  it('Calls a write object correctly', async () => {
    const mockWriteObject = jest.fn(() => ({ insert: 2, update: 0 }))
    async function * generate () {
      yield { foo: 'bar' }
      yield { foo: 'bax' }
    }
    const readable = Readable.from(generate())
    const { databaseWriter } = await import('../database-writer.js')
    await databaseWriter(readable, mockWriteObject)
    expect(mockWriteObject).toHaveBeenCalledWith({ foo: 'bar' })
    expect(mockWriteObject).toHaveBeenCalledWith({ foo: 'bax' })
    expect(mockWriteObject).toHaveBeenCalledTimes(2)
  })
})
