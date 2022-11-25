describe('site-name page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const result = { name: 'site-name', applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          findByApplicationId: () => {
            return [result]
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return result
        }
      })
    }

    const { getData } = await import('../site-name.js')
    expect(await getData(request)).toStrictEqual({ name: 'site-name' })
  })

  it('setData - update site', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()
    const site = [
      {
        id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
        createdAt: '2022-11-24T22:32:41.186Z',
        updatedAt: '2022-11-24T22:32:50.642Z',
        name: 'Kealan bravo'
      }
    ]

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'IN_PROGRESS',
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        SITE: {
          create: jest.fn(() => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })),
          update: mockUpdate,
          findByApplicationId: () => {
            return site
          }
        }
      }
    }))
    const { setData } = await import('../site-name.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: {}
        }),
        setData: mockSetData
      })
    }
    await setData(request)

    expect(mockSetData).toHaveBeenCalledWith({ applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c', siteData: { id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781', name: 'name' } })
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('setData - create site', async () => {
    const mockSetData = jest.fn()
    const site = {
      id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
      createdAt: '2022-11-24T22:32:41.186Z',
      updatedAt: '2022-11-24T22:32:50.642Z',
      name: 'Kealan bravo'
    }
    const mockCreate = jest.fn(() => (site))

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'IN_PROGRESS',
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        SITE: {
          create: mockCreate,
          update: jest.fn(),
          findByApplicationId: () => {
            return []
          }
        }
      }
    }))
    const { setData } = await import('../site-name.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: {
            id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781'
          }
        }),
        setData: mockSetData
      })
    }
    await setData(request)

    expect(mockSetData).toHaveBeenCalledWith({ applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c', siteData: { id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781', name: 'name' } })
    expect(mockCreate).toHaveBeenCalled()
  })

  it('should redirect user to site postcode page, when the site tag is in progress', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'IN_PROGRESS'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => true }
          }
        }
      }
    }))
    const { completion } = await import('../site-name.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: {}
        })
      })
    }
    expect(await completion(request)).toBe('/site-got-postcode')
  })

  it('should redirect user to check your answers page, when the tag is complete', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: jest.fn(() => 'complete') }
          }
        }
      }
    }))
    const { completion } = await import('../site-name.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: {}
        })
      })
    }
    expect(await completion(request)).toBe('/check-site-answers')
  })
})
