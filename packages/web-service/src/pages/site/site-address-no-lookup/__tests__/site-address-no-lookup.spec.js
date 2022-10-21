describe('site-got-postcode page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const request = {
      query: { postcode: 'B15 7GF' }
    }

    const { getData } = await import('../site-address-no-lookup.js')
    expect(await getData(request)).toStrictEqual({ postCode: true })
  })

  it('setData', async () => {
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          update: mockUpdate
        }
      }
    }))
    const { setData } = await import('../site-address-no-lookup.js')
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
        }))
      })
    }

    await setData(request)

    expect(mockUpdate).toHaveBeenCalledWith('6829ad54', {
      address: {
        addressLine1: '123 VICARAGE ROAD',
        addressLine2: 'HandsWorth',
        county: 'MerseySide',
        town: 'Birmingham',
        postcode: 'SW1W 0NY'
      },
      name: 'site-name'
    })
  })

  it('should redirect user to upload-map page, when the user enters the address manually and continue', async () => {
    const { completion } = await import('../site-address-no-lookup.js')
    expect(await completion()).toBe('/upload-map')
  })
})
