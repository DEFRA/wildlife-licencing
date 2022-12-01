describe('site-got-postcode page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const result = {
      siteData: { postcode: 'B15 7GF' },
      addressLookup: [{ Address: { town: 'Bristol' } }]
    }
    const mockClearPageData = jest.fn()
    const request = {
      cache: () => ({
        getData: () => result,
        clearPageData: mockClearPageData
      })
    }

    const { getData } = await import('../select-address.js')
    expect(await getData(request)).toStrictEqual({
      postcode: 'B15 7GF',
      uri: { addressForm: '/site-address-no-lookup', postcode: '/site-got-postcode' },
      addressLookup: [{ Address: { town: 'Bristol' } }]
    })
    expect(mockClearPageData).toHaveBeenCalledWith('select-address')
  })

  it('setData', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          update: mockUpdate
        }
      }
    }))
    const { setData } = await import('../select-address.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '739f4e35',
          addressLookup: [{ Address: { UPRN: '123', Street: 'VICARAGE ROAD', Postcode: 'SW1W 0NY' } }],
          siteData: { id: '6829ad54', name: 'site-name' }
        })),
        setData: mockSetData
      }),
      payload: {
        uprn: 123
      }
    }

    await setData(request)

    expect(mockSetData).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith('6829ad54', { address: { postcode: 'SW1W 0NY', street: 'VICARAGE ROAD', uprn: '123' }, name: 'site-name' })
  })
})
