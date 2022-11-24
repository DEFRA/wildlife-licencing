describe('The site national grid reference page', () => {
  beforeEach(() => jest.resetModules())

  it('getData returns the correct object', async () => {
    const result = { siteData: { gridReference: 'NY123456' } }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: jest.fn(), set: jest.fn() }
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

    const { getData } = await import('../site-grid-ref.js')
    expect(await getData(request)).toStrictEqual({ gridReference: 'NY123456' })
  })

  it('setData', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          update: mockUpdate
        },
        tags: () => {
          return { has: () => false }
        }
      }
    }))
    const { setData } = await import('../site-grid-ref.js')
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: {
            id: '12345',
            address: '123 site street, Birmingham, B1 4HY',
            name: 'site-name',
            siteMapFiles: {
              activity: 'site.pdf',
              mitigationsDuringDevelopment: 'demo.jpg',
              mitigationsAfterDevelopment: 'site-after-development.shape'
            }
          }
        }),
        setData: mockSetData,
        getPageData: () => ({
          payload: {
            'site-grid-ref': 'NY123456'
          }
        })
      })
    }
    await setData(request)

    expect(mockSetData).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith('12345',
      { address: '123 site street, Birmingham, B1 4HY', gridReference: 'NY123456', name: 'site-name', siteMapFiles: { activity: 'site.pdf', mitigationsDuringDevelopment: 'demo.jpg', mitigationsAfterDevelopment: 'site-after-development.shape' } })
  })

  it('should redirect user to site address and grid reference mismatch, when the site tag is in progress', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => false }
          }
        }
      }
    }))
    const { completion } = await import('../site-grid-ref.js')
    const request = {
      payload: {
        name: 'site-name',
        address: 'address',
        gridReference: 'NY123456'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    expect(await completion(request)).toBe('/site-check')
  })

  it('should redirect user to check your answers page, when the tag is complete', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED',
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
    const { completion } = await import('../site-grid-ref.js')
    const request = {
      payload: {
        name: 'site-name',
        address: 'address',
        gridReference: 'NY123456'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    expect(await completion(request)).toBe('/check-site-answers')
  })
})
