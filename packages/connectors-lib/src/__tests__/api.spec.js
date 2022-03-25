jest.mock('../config.js', () => ({
  api: {
    host: 'localhost',
    port: 1000,
    timeout: 10000
  }
}))

describe('The API connector', () => {
  beforeEach(() => jest.resetModules())

  it('correctly performs a successful GET request', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.get('path')
    expect(response).toEqual({ foo: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'GET' }))
  })

  it('correctly performs a successful GET request with a query', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.get('path', 'query=baz')
    expect(response).toEqual({ foo: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path?query=baz', expect.objectContaining({ method: 'GET' }))
  })

  it('returns null on a GET request failure of not-found', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.get('path')
    expect(response).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'GET' }))
  })

  it('throws on a GET request failure of bad request', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    await expect(() => API.get('path', 'query=baz')).rejects.toThrowError()
  })

  it('correctly performs a successful POST request', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.post('path', { foo: 'bar' })
    expect(response).toEqual({ foo: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'POST' }))
  })

  it('correctly performs a successful POST request with no payload', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.post('path')
    expect(response).toEqual({ foo: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'POST' }))
  })

  it('correctly performs a successful PUT request', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.put('path', { foo: 'bar' })
    expect(response).toEqual({ foo: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'PUT' }))
  })

  it('correctly performs a successful PUT request with no payload', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
      headers: { get: () => 'application/json' }
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.put('path')
    expect(response).toEqual({ foo: 'bar' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'PUT' }))
  })

  it('correctly performs a successful DELETE request', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 204
    }))
    jest.doMock('node-fetch', () => ({ default: mockFetch }))
    const { API } = await import('../api.js')
    const response = await API.delete('path')
    expect(response).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:1000/path', expect.objectContaining({ method: 'DELETE' }))
  })
})
