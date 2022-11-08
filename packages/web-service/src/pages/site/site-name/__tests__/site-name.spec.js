describe('site-name page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const result = { name: 'site-name' }
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

  it('setData', async () => {
    const mockSetData = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          create: jest.fn(() => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }))
        },
        tags: () => {
          return { has: () => false }
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

    expect(mockSetData).toHaveBeenCalledWith({ applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c', siteData: { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'name' } })
  })

  it('should redirect user to site postcode page, when the site tag is in progress', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { has: () => false }
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

  it('should not call setData when there is no a site name provided on the payload', async () => {
    const mockSetData = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          create: jest.fn(() => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' }))
        },
        tags: () => {
          return { has: () => false }
        }
      }
    }))
    const { setData } = await import('../site-name.js')
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: {}
        }),
        setData: mockSetData
      })
    }
    await setData(request)

    expect(mockSetData).not.toHaveBeenCalled()
  })

  it('should redirect user to check your answers page, when the tag is complete', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { has: () => true }
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
