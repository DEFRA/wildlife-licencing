describe('site-got-postcode page handler', () => {
  beforeEach(() => jest.resetModules())
  it('throws an error if an option is not selected', async () => {
    try {
      const payload = { 'site-postcode': '', 'site-postcode-check': 'no' }
      const { validator } = await import('../site-got-postcode.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: You have not selected an option')
    }
  })

  it('should not throws an error if a correct postcode is entered', async () => {
    const payload = { 'site-postcode': 'B23 5LT', 'site-postcode-check': 'yes' }
    const { validator } = await import('../site-got-postcode.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('should not throws an error if a correct postcode is entered', async () => {
    const payload = { 'site-postcode': 'B23 5LT', 'site-postcode-check': 'yes' }
    const { validator } = await import('../site-got-postcode.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('getData returns the postcode', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        SITE: {
          findByApplicationId: () => {
            return [{ address: { postcode: 'B45 3GP' } }]
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

    const { getData } = await import('../site-got-postcode.js')
    expect(await getData(request)).toStrictEqual({ sitePostcode: 'B45 3GP', siteManualAddress: undefined })
  })

  it('getData set true flag if the site address is manually entered', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        SITE: {
          findByApplicationId: () => {
            return [{ address: { town: 'Bristol' } }]
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

    const { getData } = await import('../site-got-postcode.js')
    expect(await getData(request)).toStrictEqual({ sitePostcode: undefined, siteManualAddress: true })
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

    const { getData } = await import('../site-got-postcode.js')
    expect(await getData(request)).toStrictEqual({ sitePostcode: undefined, siteManualAddress: undefined })
  })

  it('setData', async () => {
    const mockSetData = jest.fn()
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7', siteData: {} })),
        getPageData: jest.fn(() => ({ payload: { postcode: 'SW1W 0NY' } })),
        setData: mockSetData
      })
    }
    const mockLookup = jest.fn(() => ({ results: [{ Address: { town: 'Bristol' } }] }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      ADDRESS: {
        lookup: mockLookup
      }
    }))
    jest.doMock('path')
    jest.doMock('fs', () => ({ readdirSync: () => [] }))
    const { setData } = await import('../site-got-postcode.js')
    await setData(request)
    expect(mockSetData).toHaveBeenCalledWith({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7', siteData: { postcode: undefined }, addressLookup: [{ Address: { town: 'Bristol' } }] })
  })

  it('should redirect user to site-address-no-lookup page, when the site does not has a postcode', async () => {
    const { completion } = await import('../site-got-postcode.js')
    const request = {
      cache: () => ({
        getPageData: () => ({
          payload: {
            'site-postcode-check': 'no'
          }
        }),
        getData: jest.fn(() => ({ applicationId: '739f4e35' }))
      })
    }
    expect(await completion(request)).toBe('/site-address-no-lookup?no-postcode=true')
  })

  it('should redirect user to site-address-no-lookup page, when the postcode lookup do not match an address', async () => {
    const { completion } = await import('../site-got-postcode.js')
    const request = {
      cache: () => ({
        getPageData: () => ({
          payload: {
            'site-postcode-check': 'yes'
          }
        }),
        getData: jest.fn(() => ({ applicationId: '739f4e35', siteData: { postcode: 'B1 9ZZ' } }))
      })
    }
    expect(await completion(request)).toBe('/site-address-no-lookup')
  })

  it('should redirect user to select-address page, when the site does has a postcode', async () => {
    const { completion } = await import('../site-got-postcode.js')
    const request = {
      cache: () => ({
        getPageData: () => ({
          payload: {
            'site-postcode-check': 'yes'
          }
        }),
        getData: jest.fn(() => ({ applicationId: '739f4e35', siteData: { postcode: 'B15 7GF' }, addressLookup: [{ Address: { town: 'liverpool' } }] }))
      })
    }
    expect(await completion(request)).toBe('/select-address')
  })
})
