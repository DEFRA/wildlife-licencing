describe('The site address and National Grid Reference page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
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
      }
    }
    const mockClearPageData = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        SITE: {
          getSiteById: () => {
            return result.siteData
          }
        },
        APPLICATION: {
          tags: () => {
            return { set: jest.fn() }
          }
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: () => {
          return result
        },
        clearPageData: mockClearPageData
      })
    }

    const { getData } = await import('../site-check.js')
    expect(await getData(request)).toStrictEqual({ siteAddress: 'site street, jubilee, 123, site street, Peckham, kent, SW1W 0NY', gridReference: 'NY123456' })
    expect(mockClearPageData).toHaveBeenCalled()
  })

  it('should redirect user to check site answers page', async () => {
    const { completion } = await import('../site-check.js')
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: jest.fn() }
          }
        }
      }
    }))
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        getPageData: () => ({
          payload: {
            gridReference: 'NY123456'
          }
        })
      })
    }
    expect(await completion(request)).toBe('/check-site-answers')
  })

  it('should redirect user to the address page', async () => {
    const { completion } = await import('../site-check.js')
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: jest.fn() }
          }
        }
      }
    }))
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        getPageData: () => ({
          payload: {
            'address-and-grid-reference-mismatch': 'address'
          }
        })
      })
    }
    expect(await completion(request)).toBe('/site-got-postcode')
  })

  it('should redirect user to the site grid reference page', async () => {
    const { completion } = await import('../site-check.js')
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: jest.fn() }
          }
        }
      }
    }))
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        getPageData: () => ({
          payload: {
            'address-and-grid-reference-mismatch': 'gridReference'
          }
        })
      })
    }
    expect(await completion(request)).toBe('/site-grid-ref')
  })
})
