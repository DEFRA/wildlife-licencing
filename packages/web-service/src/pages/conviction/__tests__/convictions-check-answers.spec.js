describe('convictions check answers page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns with yes convictions choice and details of conviction', async () => {
    const mockSet = jest.fn(() => 'complete-not-confirmed')
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: mockSet
            }
          },
          getById: () => {
            return { isRelatedConviction: true, detailsOfConvictions: 'conviction', applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
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

    const { getData } = await import('../convictions-check-answers/convictions-check-answers.js')
    expect(await getData(request)).toStrictEqual([{ key: 'isAnyConviction', value: 'Yes' }, { key: 'convictionDetails', value: 'conviction' }])
    expect(mockSet).toHaveBeenCalledWith({ tag: 'declare-convictions', tagState: 'complete-not-confirmed' })
  })

  it('getData returns with no any convictions only', async () => {
    const mockSet = jest.fn(() => 'complete-not-confirmed')
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: mockSet
            }
          },
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

    const { getData } = await import('../convictions-check-answers/convictions-check-answers.js')
    expect(await getData(request)).toStrictEqual([{ key: 'isAnyConviction', value: 'No' }])
    expect(mockSet).toHaveBeenCalledWith({ tag: 'declare-convictions', tagState: 'complete-not-confirmed' })
  })

  it('should be redirected to enter the details of convictions when there are convictions', async () => {
    const mockRedirect = jest.fn()
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
    const h = { redirect: mockRedirect }
    const { checkData } = await import('../convictions-check-answers/convictions-check-answers.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/conviction-details')
  })

  it('checkData', async () => {
    const mockRedirect = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, detailsOfConvictions: 'conviction', applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
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
    const h = { redirect: mockRedirect }
    const { checkData } = await import('../convictions-check-answers/convictions-check-answers.js')
    expect(await checkData(request, h)).toBeNull()
  })

  it('should redirect user to task list page', async () => {
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }
    const mockSet = jest.fn(() => 'complete')
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: mockSet
            }
          }
        }
      }
    }))

    const { completion } = await import('../convictions-check-answers/convictions-check-answers.js')
    expect(await completion(request)).toBe('/tasklist')
    expect(mockSet).toHaveBeenCalledWith({ tag: 'declare-convictions', tagState: 'complete' })
  })
})
