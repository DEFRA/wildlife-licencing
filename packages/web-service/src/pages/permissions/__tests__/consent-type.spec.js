describe('consent-type page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          permissionData: {
            type: 'type'
          }
        })
      })
    }
    const { getData } = await import('../consent-type/consent-type.js')
    expect(await getData(request)).toStrictEqual({
      PLANNING_PERMISSION: 452120000,
      DEMOLITION_CONSENT: 452120001,
      LISTED_BUILDING_CONSENT: 452120002,
      HIGHWAYS_ACT_CONSENT: 452120003,
      MINERAL_CONSENT: 452120004,
      TREE_PRESERVATION_ORDER: 452120006,
      consentType: 'type'
    })
  })

  it('setData - creation', async () => {
    const mockCreatePermission = jest.fn()
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          createPermission: mockCreatePermission
        }
      }
    }))
    const request = {
      payload: {
        'describe-potential-conflicts': 'describe-potential-conflicts'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../consent-type/consent-type.js')
    await setData(request)
    expect(mockCreatePermission).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
  })

  it('setData - check your answers update', async () => {
    const mockUpdatePermission = jest.fn()
    const mockGetPermission = jest.fn()
    const mockSet = jest.fn()
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
        'consent-type-check': '452120000'
      },
      query: {
        id: 1
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../consent-type/consent-type.js')
    await setData(request)
    expect(mockGetPermission).toHaveBeenCalled()
    expect(mockUpdatePermission).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
  })

  it('should redirect user to the authority page', async () => {
    const { completion } = await import('../consent-type/consent-type.js')
    expect(await completion()).toBe('/authority')
  })
})
