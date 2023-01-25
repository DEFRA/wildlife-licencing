describe('The miscellaneous route handlers', () => {
  beforeEach(() => jest.resetModules())
  it('Unauthorized access redirects to the which-species handler', async () => {
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/')
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    await route.handler(null, h)
    expect(mockRedirect).toHaveBeenCalledWith('/which-species')
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
    delete process.env.ALLOW_RESET
  })

  it('The set system date handler calls the fake date', async () => {
    process.env.ALLOW_RESET = 'YES'
    const mockSetGlobalDate = jest.fn()
    jest.doMock('../../common/fake-date.js', () => ({
      setGlobalDate: mockSetGlobalDate,
      unsetGlobalDate: jest.fn()
    }))
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/set-sysdate')
    const mockCode = jest.fn(() => ({ type: jest.fn() }))
    await route.handler({ query: { 'iso-string': '2011-10-05T14:48:00.000Z' } }, { response: () => ({ code: mockCode }) })
    expect(mockCode).toHaveBeenCalledWith(200)
    expect(mockSetGlobalDate).toHaveBeenCalledWith('2011-10-05T14:48:00.000Z')
    delete process.env.ALLOW_RESET
  })

  it('The reset system date handler calls the fake date', async () => {
    process.env.ALLOW_RESET = 'YES'
    const mockUnsetGlobalDate = jest.fn()
    jest.doMock('../../common/fake-date.js', () => ({
      setGlobalDate: jest.fn(),
      unsetGlobalDate: mockUnsetGlobalDate
    }))
    const misc = (await import('../misc-routes.js')).default
    const route = misc.find(r => r.method === 'GET' && r.path === '/reset-sysdate')
    const mockCode = jest.fn(() => ({ type: jest.fn() }))
    await route.handler({}, { response: () => ({ code: mockCode }) })
    expect(mockCode).toHaveBeenCalledWith(200)
    expect(mockUnsetGlobalDate).toHaveBeenCalled()
    delete process.env.ALLOW_RESET
  })
})
