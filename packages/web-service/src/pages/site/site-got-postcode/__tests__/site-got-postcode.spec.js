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

  it('getData returns the correct object', async () => {
    const result = { siteData: { postcode: 'B15 7GF' } }
    const mockClearPageData = jest.fn()
    const request = {
      cache: () => ({
        getData: () => {
          return result
        },
        clearPageData: mockClearPageData
      })
    }

    const { getData } = await import('../site-got-postcode.js')
    expect(await getData(request)).toStrictEqual({ sitePostcode: 'B15 7GF' })
    expect(mockClearPageData).toHaveBeenCalledWith('site-got-postcode')
  })

  it('setData', async () => {
    const mockSetData = jest.fn()
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7', siteData: {} })),
        getPageData: jest.fn(() => ({ payload: { postcode: 'SW1W 0NY' } })),
        setData: mockSetData,
        clearPageData: jest.fn()
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
        getData: jest.fn(() => ({ applicationId: '739f4e35', siteData: { postcode: 'B15 7GF' } }))
      })
    }
    expect(await completion(request)).toBe('/site-address-no-lookup?no-postcode=true')
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
        getData: jest.fn(() => ({ applicationId: '739f4e35', siteData: { postcode: 'B15 7GF' } }))
      })
    }
    expect(await completion(request)).toBe('/select-address')
  })
})
