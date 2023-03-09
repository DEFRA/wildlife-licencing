describe('The permissions authority page', () => {
  beforeEach(() => jest.resetModules())

  it('getData with selected authority', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: () => ({ authority: '7829ad54-bab7-4a78-8ca9-dcf722117a45' })
        },
        OTHER: {
          authorities: () => [
            { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 1' },
            { id: '7829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 3' },
            { id: '8829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 2' }
          ]
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return {
            applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
            permissionData: {
              sddsPermissionsId: '12345-6789'
            }
          }
        }
      })
    }
    const { getData } = await import('../authority/authority.js')
    const result = await getData(request)
    expect(result).toEqual({
      authorities: [
        {
          id: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 1',
          selected: false
        },
        {
          id: '7829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 3',
          selected: true
        },
        {
          id: '8829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 2',
          selected: false
        }
      ]
    })
  })

  it('getData with out selected authority', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: () => ({ type: '7829ad54' })
        },
        OTHER: {
          authorities: () => [
            { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 1' },
            { id: '7829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 3' },
            { id: '8829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 2' }
          ]
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return {
            applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
            permissionData: {
              sddsPermissionsId: '12345-6789'
            }
          }
        }
      })
    }
    const { getData } = await import('../authority/authority.js')
    const result = await getData(request)
    expect(result).toEqual({
      authorities: [
        {
          id: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 1'
        },
        {
          id: '7829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 3'
        },
        {
          id: '8829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 2'
        }
      ]
    })
  })

  it('setData', async () => {
    const mockUpdatePermission = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: () => ({ authority: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }),
          updatePermission: mockUpdatePermission
        },
        OTHER: {
          authorities: () => [
            { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 1' },
            { id: '7829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 3' },
            { id: '8829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 2' }
          ]
        }
      }
    }))
    const request = {
      payload: {
        authorityId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
        fbAuthorityId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
      },
      cache: () => ({
        getData: () => {
          return {
            applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
            permissionData: {
              sddsPermissionsId: '12345-6789'
            }
          }
        },
        setData: jest.fn()
      })
    }
    const { setData } = await import('../authority/authority.js')
    await setData(request)
    expect(mockUpdatePermission).toHaveBeenCalled()
  })

  it('should redirect user to the planning type page when the consent type is planning development', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: () => ({ type: 452120000 })
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
    const { completion } = await import('../authority/authority.js')
    expect(await completion(request)).toBe('/planning-type')
  })

  it('should redirect user to the consent reference page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: () => ({})
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
    const { completion } = await import('../authority/authority.js')
    expect(await completion(request)).toBe('/consent-reference')
  })
})
