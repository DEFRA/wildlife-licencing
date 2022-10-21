describe('site-got-postcode page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the correct object', async () => {
    const result = { siteData: { sitePostcode: 'B15 7GF' } }
    const request = {
      cache: () => ({
        getData: () => {
          return result
        }
      })
    }

    const { getData } = await import('../site-got-postcode.js')
    expect(await getData(request)).toStrictEqual({ sitePostcode: 'B15 7GF' })
  })

  it.skip('setData', async () => {
    const mockSetData = jest.fn()
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })),
        clearPageData: jest.fn(() => ({ payload: { postcode: 'SW1W 0NY' } })),
        setData: mockSetData
      }),
      payload: {
        'site-postcode': 'SW1W 0NY'
      }
    }
    const { setData } = await import('../site-got-postcode.js')
    const mockLookup = jest.fn(() => ({ results: [{ Address: { town: 'Bristol' } }] }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      ADDRESS: {
        lookup: mockLookup
      }
    }))

    await setData(request)

    expect(mockSetData).toHaveBeenCalledWith({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })
  })

  it('should redirect user to upload-map page, when the site does not has a postcode', async () => {
    const { completion } = await import('../site-got-postcode.js')
    const request = {
      cache: () => ({
        getPageData: () => ({
          payload: {
            'site-postcode-check': 'no'
          }
        })
      })
    }
    expect(await completion(request)).toBe('/upload-map')
  })

  it('should redirect user to select-address page, when the site does has a postcode', async () => {
    const { completion } = await import('../site-got-postcode.js')
    const request = {
      cache: () => ({
        getPageData: () => ({
          payload: {
            'site-postcode-check': 'yes'
          }
        })
      })
    }
    expect(await completion(request)).toBe('/select-address')
  })
})
