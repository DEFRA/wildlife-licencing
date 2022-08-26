
describe('the check-application', () => {
  it('checks that an applicationId is set in the cache and returns a redirect if not', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({}))
      })
    }
    const mockRedirect = jest.fn(() => 'redirect')
    const h = {
      redirect: mockRedirect
    }
    const { checkApplication } = await import('../check-application.js')
    const result = await checkApplication(request, h)
    expect(result).toEqual('redirect')
    expect(mockRedirect).toHaveBeenCalledWith('/applications')
  })

  it('checks that an applicationId is set in the cache and returns null if so', async () => {
    jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
      return ({ init: () => Promise.resolve() })
    }))
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ applicationId: '123' }))
      })
    }
    const { checkApplication } = await import('../check-application.js')
    const result = await checkApplication(request, {})
    expect(result).toBeNull()
  })
})
