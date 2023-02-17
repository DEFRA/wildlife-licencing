describe('site-name page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const result = { name: 'site-name', applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => 'complete', set: jest.fn() }
          }
        },
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

  it('getData returns the site name undefined when there is no site', async () => {
    const result = { name: 'site-name', applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => 'complete', set: jest.fn() }
          }
        },
        SITE: {
          findByApplicationId: () => {
            return []
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
    expect(await getData(request)).toStrictEqual({ name: undefined })
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

  it('getData sets the journey tag to be in-progress', async () => {
    const mockTagFn = jest.fn()

    jest.doMock('../../../common/tag-functions.js', () => ({
      moveTagInProgress: mockTagFn,
      isCompleteOrConfirmed: (tagState) => (tagState === 'complete') || (tagState === 'complete-not-confirmed')
    }))
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          findByApplicationId: () => []
        },
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
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

    const { getData } = await import('../site-name.js')
    await getData(request)
    expect(mockTagFn).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c', 'sites')
  })

  it('the checkData returns the user to the cya page if the journey is complete', async () => {
    const mockRedirect = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    const h = {
      redirect: mockRedirect
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
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
    const { checkData } = await import('../site-name.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/check-site-answers')
  })
})
