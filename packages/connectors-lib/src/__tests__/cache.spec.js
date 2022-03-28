const so = { foo: 'bar' }
const mockSet = jest.fn().mockImplementation(() => {})
const mockGet = jest.fn().mockImplementation(() => {})
const mockDel = jest.fn().mockImplementation(() => {})
const mockKeys = jest.fn().mockImplementation(() => [])

describe('Caching', () => {
  it('the save, restore, delete and keys cache functions are called correctly', async () => {
    jest.doMock('redis', () => {
      return {
        createClient: () => ({
          set: mockSet,
          get: mockGet,
          GETDEL: mockDel,
          KEYS: mockKeys,
          on: jest.fn(),
          connect: jest.fn()
        })
      }
    })

    const { REDIS } = await import('../redis.js')
    const { cache } = REDIS
    await REDIS.initialiseConnection()

    await cache.save('key', so)
    await cache.restore('key')
    await cache.delete('key')
    await cache.keys('str')
    expect(mockSet).toHaveBeenCalledWith('key', JSON.stringify(so), {
      EX: 3600
    })
    expect(mockGet).toHaveBeenCalledWith('key', {
      EX: 3600
    })
    expect(mockDel).toHaveBeenCalledWith('key')
    expect(mockKeys).toHaveBeenCalledWith('str')
  })
})
