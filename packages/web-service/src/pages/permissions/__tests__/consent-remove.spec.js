describe('consent-remove page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermissions: () => {
            return [
              {
                id: 123,
                type: 452120000,
                referenceNumber: 'reference-98765'
              }
            ]
          }
        }
      }
    }))
    const request = {
      query: {
        id: 123
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { getData } = await import('../consent-remove/consent-remove.js')
    expect(await getData(request)).toStrictEqual({ permissionType: 'Planning permission', consentReference: 'reference-98765' })
  })

  it('setData', async () => {
    const mockRemovePermission = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          removePermission: mockRemovePermission
        }
      }
    }))
    const request = {
      payload: {
        'consent-remove': 'yes'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { setData } = await import('../consent-remove/consent-remove.js')
    await setData(request)
    expect(mockRemovePermission).toHaveBeenCalled()
    expect(await setData(request)).toBeNull()
  })

  it('should redirect user to check your answers page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        PERMISSION: {
          getPermissions: () => {
            return [
              {
                id: 123,
                type: 452120000,
                referenceNumber: 'reference-98765'
              }
            ]
          }
        },
        APPLICATION: {
          tags: () => {
            return { get: () => 'complete' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../consent-remove/consent-remove.js')
    expect(await completion(request)).toBe('/check-your-answers')
  })

  it('should redirect user to the add permissions start page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        PERMISSION: {
          getPermissions: () => {
            return []
          }
        },
        APPLICATION: {
          tags: () => {
            return { get: () => '' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../consent-remove/consent-remove.js')
    expect(await completion(request)).toBe('/add-permission-start')
  })

  it('should redirect user to permissions check answers page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        PERMISSION: {
          getPermissions: () => {
            return [{}]
          }
        },
        APPLICATION: {
          tags: () => {
            return { get: () => '' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../consent-remove/consent-remove.js')
    expect(await completion(request)).toBe('/check-permissions-answers')
  })
})
