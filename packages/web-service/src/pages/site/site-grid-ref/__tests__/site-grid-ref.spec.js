describe('The site national grid reference page', () => {
  beforeEach(() => jest.resetModules())

  it('getData returns the correct object', async () => {
    const mockClearPageData = jest.fn()
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
        },
        clearPageData: mockClearPageData
      })
    }

    const { getData } = await import('../site-grid-ref.js')
    expect(await getData(request)).toStrictEqual({ gridReference: 'NY123456' })
    expect(mockClearPageData).toHaveBeenCalledWith('site-grid-ref')
  })

  it('getData returns  undefined if not site found', async () => {
    const mockClearPageData = jest.fn()
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
        },
        clearPageData: mockClearPageData
      })
    }

    const { getData } = await import('../site-grid-ref.js')
    expect(await getData(request)).toStrictEqual({ gridReference: undefined })
    expect(mockClearPageData).toHaveBeenCalledWith('site-grid-ref')
  })

  it('setData with site', async () => {
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

  it('setData with no site', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return []
          }
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
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('should redirect user to site address and grid reference mismatch, when there is proximity flag', async () => {
    const result = {
      siteData: {
        id: '12345',
        address: {
          subBuildingName: 'site street',
          buildingName: 'jubilee',
          buildingNumber: '123',
          street: 'site street',
          town: 'Peckham',
          county: 'kent',
          postcode: 'SW1W 0NY',
          xCoordinate: '123567',
          yCoordinate: '145345'
        },
        name: 'site-name',
        gridReference: 'NY123456',
        siteMapFiles: {
          activity: 'site.pdf',
          mitigationsDuringDevelopment: 'demo.jpg',
          mitigationsAfterDevelopment: 'site-after-development.shape'
        }
      },
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        SITE: {
          getSiteById: () => (result.siteData)
        },
        APPLICATION: {
          tags: () => {
            return {
              get: () => false,
              set: () => false
            }
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
        getData: () => (result)
      })
    }
    expect(await completion(request)).toBe('/site-check')
  })

  it('should redirect user to site address and grid reference mismatch, when the entered site grid reference is invalid', async () => {
    const result = {
      siteData: {
        id: '12345',
        address: {
          subBuildingName: 'site street',
          buildingName: 'jubilee',
          buildingNumber: '123',
          street: 'site street',
          town: 'Peckham',
          county: 'kent',
          postcode: 'SW1W 0NY',
          xCoordinate: '123567',
          yCoordinate: '145345'
        },
        name: 'site-name',
        gridReference: 'HH123123',
        siteMapFiles: {
          activity: 'site.pdf',
          mitigationsDuringDevelopment: 'demo.jpg',
          mitigationsAfterDevelopment: 'site-after-development.shape'
        }
      },
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        SITE: {
          getSiteById: () => (result.siteData)
        },
        APPLICATION: {
          tags: () => {
            return {
              get: () => false,
              set: () => false
            }
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
        getData: () => (result)
      })
    }
    expect(await completion(request)).toBe('/site-check')
  })

  it('should redirect user to check your answers page, when the site address and grid reference match', async () => {
    const result = {
      siteData: {
        id: '12345',
        address: {
          subBuildingName: 'site street',
          buildingName: 'jubilee',
          buildingNumber: '123',
          street: 'site street',
          town: 'Peckham',
          county: 'kent',
          postcode: 'B38 8BG',
          xCoordinate: '404314',
          yCoordinate: '278431'
        },
        name: 'site-name',
        gridReference: 'SP043784',
        siteMapFiles: {
          activity: 'site.pdf',
          mitigationsDuringDevelopment: 'demo.jpg',
          mitigationsAfterDevelopment: 'site-after-development.shape'
        }
      },
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          getSiteById: () => (result.siteData)
        },
        APPLICATION: {
          tags: () => {
            return {
              get: () => false,
              set: () => false
            }
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
        getData: () => (result)
      })
    }
    expect(await completion(request)).toBe('/check-site-answers')
  })
})
