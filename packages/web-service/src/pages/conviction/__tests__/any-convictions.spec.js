describe('Any convictions page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns there are convictions', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { getData } = await import('../any-conviction/any-convictions.js')
    expect(await getData(request)).toStrictEqual({ yesNo: true })
  })

  it('getData returns there are no any convictions', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: false, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { getData } = await import('../any-conviction/any-convictions.js')
    expect(await getData(request)).toStrictEqual({ yesNo: false })
  })

  it('getData returns with no choices', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { getData } = await import('../any-conviction/any-convictions.js')
    expect(await getData(request)).toStrictEqual({ yesNo: undefined })
  })

  it('setData - update application with true flag of convictions', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          },
          update: mockUpdate
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        },
        getPageData: () => ({ payload: { 'convictions-check': 'yes' } })
      })
    }

    const { setData } = await import('../any-conviction/any-convictions.js')
    await setData(request)
    expect(mockUpdate).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c', {
      isRelatedConviction: true,
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
    })
  })

  it('setData - update application with false flag of convictions', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          },
          update: mockUpdate
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        },
        getPageData: () => ({ payload: { 'convictions-check': 'no' } })
      })
    }

    const { setData } = await import('../any-conviction/any-convictions.js')
    await setData(request)
    expect(mockUpdate).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c', {
      isRelatedConviction: false,
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
    })
  })

  it('should redirect user to convictions check your answers page, when the user selects no convictions radio', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getPageData: () => ({ payload: { 'convictions-check': 'no' } })
      })
    }

    const { completion } = await import('../any-conviction/any-convictions.js')
    expect(await completion(request)).toBe('/convictions-check-answers')
  })

  it('should redirect user to convictions details page, when the user selects yes radio', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getPageData: () => ({ payload: { 'convictions-check': 'yes' } })
      })
    }

    const { completion } = await import('../any-conviction/any-convictions.js')
    expect(await completion(request)).toBe('/conviction-details')
  })
})
