
describe('the check-application', () => {
  beforeEach(() => jest.resetModules())

  it('checks that an applicationId is set in the cache and returns a redirect if not', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({}))
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {}
        }
      }
    }))
    const mockRedirect = jest.fn(() => 'redirect')
    const h = {
      redirect: mockRedirect
    }
    const { checkApplication } = await import('../check-application.js')
    const result = await checkApplication(request, h)
    expect(result).toEqual('redirect')
    expect(mockRedirect).toHaveBeenCalledWith('/applications')
  })

  it('checks if an application has been submitted, and returns a redirect if it has', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { userSubmission: '01-01-2022' }
          }
        }
      }
    }))
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    const { checkApplication } = await import('../check-application.js')
    await checkApplication(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/applications')
  })

  it('checks that an applicationId is set in the cache and returns null if so', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {}
        }
      }
    }))
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
