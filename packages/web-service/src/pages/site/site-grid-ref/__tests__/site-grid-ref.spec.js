describe('The site national grid reference page', () => {
  beforeEach(() => jest.resetModules())

  it('getData returns the correct object', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        SITE: {
          findByApplicationId: () => {
            return [{ gridReference: 'NY123456' }]
          }
        },
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
          return {}
        }
      })
    }

    const { getData } = await import('../site-grid-ref.js')
    expect(await getData(request)).toStrictEqual({ gridReference: 'NY123456' })
  })

  it('getData returns  undefined if not site found', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        SITE: {
          findByApplicationId: () => {
            return []
          }
        },
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
          return {}
        }
      })
    }

    const { getData } = await import('../site-grid-ref.js')
    expect(await getData(request)).toStrictEqual({ gridReference: undefined })
  })

  it('setData', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()
    const site = [
      {
        id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
        createdAt: '2022-11-24T22:32:41.186Z',
        updatedAt: '2022-11-24T22:32:50.642Z',
        name: 'Kealan bravo',
        address: {
          town: 'BIRMINGHAM',
          uprn: '100070567486',
          street: 'WITTON LODGE ROAD',
          country: 'ENGLAND',
          postcode: 'B23 5LT',
          xCoordinate: 409884,
          yCoordinate: 293389,
          buildingNumber: '308'
        },
        siteMapFiles: {
          activity: 'site.pdf',
          mitigationsDuringDevelopment: 'demo.jpg',
          mitigationsAfterDevelopment: 'site-after-development.shape'
        }
      }
    ]

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return site
          }
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
    expect(mockUpdate).toHaveBeenCalledWith('8917f37b-fbf9-4dc7-8cd7-28c354b36781', {
      id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
      createdAt: '2022-11-24T22:32:41.186Z',
      updatedAt: '2022-11-24T22:32:50.642Z',
      name: 'Kealan bravo',
      gridReference: 'NY123456',
      address: {
        town: 'BIRMINGHAM',
        uprn: '100070567486',
        street: 'WITTON LODGE ROAD',
        country: 'ENGLAND',
        postcode: 'B23 5LT',
        xCoordinate: 409884,
        yCoordinate: 293389,
        buildingNumber: '308'
      },
      siteMapFiles: {
        activity: 'site.pdf',
        mitigationsDuringDevelopment: 'demo.jpg',
        mitigationsAfterDevelopment: 'site-after-development.shape'
      }
    })
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
