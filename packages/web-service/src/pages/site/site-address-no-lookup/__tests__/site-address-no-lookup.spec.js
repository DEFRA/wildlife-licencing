describe('site-got-postcode page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const request = {
      query: { postcode: 'B15 7GF' }
    }

    const { getData } = await import('../site-address-no-lookup.js')
    expect(await getData(request)).toStrictEqual({ postCode: true })
  })

  it('setData with site info', async () => {
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return [{ id: '6829ad54', name: 'site-name' }]
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '739f4e35',
          addressLookup: [{ Address: { UPRN: '123', Street: 'VICARAGE ROAD', Postcode: 'SW1W 0NY' } }],
          siteData: { id: '6829ad54', name: 'site-name' }
        })),
        getPageData: jest.fn(() => ({
          payload: {
            'address-line-1': '123 VICARAGE ROAD',
            'address-line-2': 'HandsWorth',
            'address-town': 'Birmingham',
            'address-county': 'MerseySide',
            'address-postcode': 'SW1W 0NY'
          }
        })),
        setData: jest.fn()
      })
    }
    const { setData } = await import('../site-address-no-lookup.js')

    await setData(request)

    expect(mockUpdate).toHaveBeenCalledWith('6829ad54', {
      address: {
        addressLine1: '123 VICARAGE ROAD',
        addressLine2: 'HandsWorth',
        county: 'MerseySide',
        town: 'Birmingham',
        postcode: 'SW1W 0NY'
      },
      id: '6829ad54',
      name: 'site-name'
    })
  })

  it('setData with no site info', async () => {
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return []
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '739f4e35',
          addressLookup: [{ Address: { UPRN: '123', Street: 'VICARAGE ROAD', Postcode: 'SW1W 0NY' } }],
          siteData: { id: '6829ad54', name: 'site-name' }
        })),
        getPageData: jest.fn(() => ({
          payload: {
            'address-line-1': '123 VICARAGE ROAD',
            'address-line-2': 'HandsWorth',
            'address-town': 'Birmingham',
            'address-county': 'MerseySide',
            'address-postcode': 'SW1W 0NY'
          }
        })),
        setData: jest.fn()
      })
    }
    const { setData } = await import('../site-address-no-lookup.js')

    await setData(request)

    expect(mockUpdate).toHaveBeenCalledWith(undefined, {
      address: {
        addressLine1: '123 VICARAGE ROAD',
        addressLine2: 'HandsWorth',
        county: 'MerseySide',
        town: 'Birmingham',
        postcode: 'SW1W 0NY'
      }
    })
  })

  it('should redirect user to the site map upload page, when the site tag is in progress', async () => {
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
    const { completion } = await import('../site-address-no-lookup.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: { postcode: 'B15 7GF' },
          addressLookup: [{ Address: { town: 'Bristol' } }]
        })
      })
    }
    expect(await completion(request)).toBe('/upload-map')
  })

  it('should redirect user to check site answers page, when the tag is complete', async () => {
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
    const { completion } = await import('../site-address-no-lookup.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          siteData: { postcode: 'B15 7GF' },
          addressLookup: [{ Address: { town: 'Bristol' } }]
        })
      })
    }
    expect(await completion(request)).toBe('/check-site-answers')
  })
})
