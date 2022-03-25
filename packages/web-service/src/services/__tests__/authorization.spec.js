
describe('The authorization scheme', () => {
  beforeEach(() => jest.resetModules())
  it('Unauthorized access redirects to the login handler', async () => {
    const authorization = await import('../authorization.js')
    const { authenticate } = authorization.default()
    const request = {
      cache: () => ({
        getAuthData: () => null
      })
    }
    const mockRedirect = jest.fn(() => ({ takeover: () => 'takeover' }))
    const h = {
      redirect: mockRedirect
    }
    const result = await authenticate(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/login')
    expect(result).toBe('takeover')
  })

  it('Authorized access calls authenticated tool-kit function the ', async () => {
    const authorization = await import('../authorization.js')
    const { authenticate } = authorization.default()
    const request = {
      cache: () => ({
        getAuthData: () => ({ id: 'd1887515-b803-48ad-9493-775fd184ce89' })
      })
    }
    const mockAuthenticated = jest.fn()
    const h = {
      authenticated: mockAuthenticated
    }
    await authenticate(request, h)
    expect(mockAuthenticated).toHaveBeenCalledWith({ credentials: { user: 'd1887515-b803-48ad-9493-775fd184ce89' } })
  })
})
