describe('The session-manager', () => {
  beforeEach(() => jest.resetModules())

  it('Create a session-cookie and a session-cache if no cookie', async () => {
    const sm = await import('../session-manager.js')
    const sessionManager = sm.default('sid')
    const request = {
      path: '/path',
      state: { sid: null }
    }
    const mockState = jest.fn()
    const mockTakeover = jest.fn(() => 'takeover')
    const mockRedirect = jest.fn(() => ({ takeover: mockTakeover }))
    const h = {
      state: mockState,
      redirect: mockRedirect,
      continue: 'continue'
    }
    const result = await sessionManager(request, h)
    expect(result).toBe('continue')
    expect(mockState).toHaveBeenCalledWith('sid', { id: expect.any(String) })
  })

  it('Reset expiry on the session-cookie and continue if session-cookie exists', async () => {
    const sm = await import('../session-manager.js')
    const sessionManager = sm.default('sid')
    const request = {
      path: '/path',
      state: { sid: { id: '43880ea0-45bc-4735-ba2a-1869a2a7aa94' } }
    }
    const mockState = jest.fn()
    const h = {
      state: mockState,
      continue: 'continue'
    }
    const result = await sessionManager(request, h)
    expect(result).toBe('continue')
    expect(mockState).toHaveBeenCalledWith('sid', { id: '43880ea0-45bc-4735-ba2a-1869a2a7aa94' })
  })

  it('Does nothing with static resource', async () => {
    const sm = await import('../session-manager.js')
    const sessionManager = sm.default('sid')
    const request = {
      path: '/robots.txt'
    }
    const h = {
      continue: 'continue'
    }
    const result = await sessionManager(request, h)
    expect(result).toBe('continue')
  })
})
