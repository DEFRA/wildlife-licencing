describe('permissions page handler', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ELIGIBILITY: {
          getById: () => {
            return { permissionsRequired: true }
          }
        },
        APPLICATION: {
          tags: () => {
            return { get: () => 'complete', set: jest.fn() }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { getData } = await import('../permissions/permissions.js')
    expect(await getData(request)).toStrictEqual({ permissionsRequired: true })
  })

  it('should redirect to check your answers page when the journey is complete', async () => {
    const mockRedirect = jest.fn()
    const request = {
      headers: {
        referer: 'https://www.defra.com/tasklist'
      },
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    const h = {
      redirect: mockRedirect
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => 'complete', set: jest.fn() }
          }
        }
      }
    }))
    const { checkData } = await import('../permissions/permissions.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/check-your-answers')
  })

  it('should return null when the journey is not complete', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    const h = {}
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => 'in-progress', set: jest.fn() }
          }
        }
      }
    }))
    const { checkData } = await import('../permissions/permissions.js')
    expect(await checkData(request, h)).toBeNull()
  })

  it('setData', async () => {
    const mockPutByIdn = jest.fn()
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ELIGIBILITY: {
          getById: () => {
            return {
              permissionsRequired: false
            }
          },
          putById: mockPutByIdn
        }
      }
    }))
    const request = {
      payload: {
        permissionsRequired: 'yes'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../permissions/permissions.js')
    await setData(request)
    expect(mockPutByIdn).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
  })

  it('should redirect user to add permissions page', async () => {
    const request = {
      payload: {
        permissionsRequired: 'yes'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../permissions/permissions.js')
    expect(await completion(request)).toBe('/add-permission-start')
  })

  it('should redirect user to why no permissions page', async () => {
    const request = {
      payload: {
        permissionsRequired: 'no'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../permissions/permissions.js')
    expect(await completion(request)).toBe('/why-no-permission')
  })
})
