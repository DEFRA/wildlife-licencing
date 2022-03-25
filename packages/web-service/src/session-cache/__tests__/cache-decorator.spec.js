
describe('The cache-decorator', () => {
  beforeEach(() => jest.resetModules())

  it('Can get and set cache data for journey', async () => {
    const mockSave = jest.fn()
    const mockRestore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    const mockDelete = jest.fn()

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          restore: mockRestore,
          delete: mockDelete
        }
      }
    }))
    const cd = await import('../cache-decorator.js')
    const cacheDecorator = cd.default('sid')
    const response = cacheDecorator.call({
      path: '/path',
      state: { sid: { id: 'af474441-9efa-4560-9c2a-663844ec59b6' } }
    })
    await response.setData({ foo: 'bar' })
    expect(mockSave).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_data', { foo: 'bar' })
    const result = await response.getData()
    expect(mockRestore).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_data')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('Can get and set cache data for auth', async () => {
    const mockSave = jest.fn()
    const mockRestore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    const mockDelete = jest.fn()

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          restore: mockRestore,
          delete: mockDelete
        }
      }
    }))
    const cd = await import('../cache-decorator.js')
    const cacheDecorator = cd.default('sid')
    const response = cacheDecorator.call({
      path: '/path',
      state: { sid: { id: 'af474441-9efa-4560-9c2a-663844ec59b6' } }
    })
    await response.setAuthData({ foo: 'bar' })
    expect(mockSave).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_auth', { foo: 'bar' })
    const result = await response.getAuthData()
    expect(mockRestore).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_auth')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('Can get and set cache data for the page', async () => {
    const mockSave = jest.fn()
    const mockRestore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    const mockDelete = jest.fn()

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          restore: mockRestore,
          delete: mockDelete
        }
      }
    }))
    const cd = await import('../cache-decorator.js')
    const cacheDecorator = cd.default('sid')
    const response = cacheDecorator.call({
      path: '/path',
      state: { sid: { id: 'af474441-9efa-4560-9c2a-663844ec59b6' } }
    })
    await response.setPageData({ foo: 'bar' })
    expect(mockSave).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_/path', { foo: 'bar' })
    const result = await response.getPageData()
    expect(mockRestore).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_/path')
    expect(result).toEqual({ foo: 'bar' })
    await response.clearPageData()
    expect(mockDelete).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_/path')
    await response.clearPageData('another')
    expect(mockDelete).toHaveBeenLastCalledWith('af474441-9efa-4560-9c2a-663844ec59b6_/another')
  })

  it('throw error if no session cookie', async () => {
    jest.doMock('@defra/wls-connectors-lib')
    const cd = await import('../cache-decorator.js')
    const cacheDecorator = cd.default('sid')
    await expect(async () => await cacheDecorator.call({ state: { sid: null } })).rejects.toThrowError()
  })
})
