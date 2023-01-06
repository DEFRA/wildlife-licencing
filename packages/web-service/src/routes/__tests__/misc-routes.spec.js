describe('The miscellaneous route handlers', () => {
  beforeEach(() => jest.resetModules())
  it('Unauthorized access redirects to the login handler', async () => {
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/')
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    await route.handler(null, h)
    expect(mockRedirect).toHaveBeenCalledWith('/applications')
  })
  it('The health route returns a status of 200', async () => {
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/health')
    const mockCode = jest.fn()
    await route.handler(null, { response: () => ({ code: mockCode }) })
    expect(mockCode).toHaveBeenCalledWith(200)
  })
  it('The reset route returns a status of 200', async () => {
    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        OTHER: {
          reset: jest.fn()
        }
      }
    }))
    process.env.ALLOW_RESET = 'YES'
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/reset')
    const mockCode = jest.fn(() => ({ type: jest.fn() }))
    await route.handler({ request: { query: { username: 'user0@email.com' } } }, { response: () => ({ code: mockCode }) })
    expect(mockCode).toHaveBeenCalledWith(200)
    delete process.env.ALLOW_RESET
  })
  it('The reset route is not instantiated by default', async () => {
    delete process.env.ALLOW_RESET
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/reset')
    expect(route).not.toBeDefined()
  })
})
