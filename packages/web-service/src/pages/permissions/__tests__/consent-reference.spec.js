describe('consent-reference page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          permissionData: {
            type: 452120000,
            referenceNumber: 'reference-98765'
          }
        })
      })
    }
    const { getData } = await import('../consent-reference/consent-reference.js')
    expect(await getData(request)).toStrictEqual({ consentType: 'Planning permission', consentReference: 'reference-98765' })
  })

  it('setData', async () => {
    const mockGetPermission = jest.fn()
    const mockUpdatePermission = jest.fn()
    const mockSetData = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: mockGetPermission,
          updatePermission: mockUpdatePermission
        }
      }
    }))
    const request = {
      payload: {
        reference: 'reference'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSetData
      })
    }
    const { setData } = await import('../consent-reference/consent-reference.js')
    await setData(request)
    expect(mockGetPermission).toHaveBeenCalled()
    expect(mockUpdatePermission).toHaveBeenCalled()
    expect(mockSetData).toHaveBeenCalled()
  })

  it('should redirect user to check your answers page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
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
    const { completion } = await import('../consent-reference/consent-reference.js')
    expect(await completion(request)).toBe('/check-your-answers')
  })

  it('should redirect user to permissions check answers page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
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
    const { completion } = await import('../consent-reference/consent-reference.js')
    expect(await completion(request)).toBe('/check-permissions-answers')
  })
})
