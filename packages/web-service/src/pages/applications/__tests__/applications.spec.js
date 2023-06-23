describe('applications page', () => {
  beforeEach(() => jest.resetModules())

  it('recalls the applications for a user', async () => {
    const mockFindByUser = jest.fn(() => [
      {
        id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
        applicationTags: [{ tag: 'eligibility-check', tagState: 'complete' }],
        updatedAt: '2022-03-25T14:10:14.861Z'
      },
      {
        id: '9179c2f2-6eec-43d6-899b-6504d6a1e798',
        updatedAt: '2022-04-25T14:10:14.861Z',
        submitted: '2022-04-25T14:10:14.861Z'
      }
    ])
    jest.doMock('../../../services/api-requests.js', () => {
      const { tagStatus } = jest.requireActual('../../../services/api-requests.js')
      return {
        tagStatus,
        APIRequests: {
          SITE: {
            getApplicationSitesByUserId: jest.fn(() => [])
          },
          LICENCES: {
            findByApplicationId: jest.fn().mockReturnValueOnce([{
              id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
              applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
              endDate: '2022-08-26',
              startDate: '2022-08-10',
              licenceNumber: 'LI-0016N0Z4'
            }]).mockReturnValue([])
          },
          APPLICATION: {
            tags: () => {
              return {
                getAll: () => []
              }
            },
            findByUser: mockFindByUser
          }
        }
      }
    })
    const mockGetData = jest.fn(() => ({ userId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
    const { getData } = await import('../applications.js')
    const request = {
      cache: () => ({
        getData: mockGetData
      })
    }
    const result = await getData(request)
    expect(mockGetData).toHaveBeenCalled()
    expect(mockFindByUser).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e')
    expect(result.applications).toEqual([
      {
        id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
        lastSaved: '25 March 2022',
        completed: 1,
        updatedAt: '2022-03-25T14:10:14.861Z',
        site: undefined,
        submitted: null,
        applicationTags: [{ tag: 'eligibility-check', tagState: 'complete' }],
        licences: [{
          id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
          applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
          endDate: '2022-08-26',
          startDate: '2022-08-10',
          licenceNumber: 'LI-0016N0Z4'
        }]
      },
      {
        completed: 0,
        id: '9179c2f2-6eec-43d6-899b-6504d6a1e798',
        lastSaved: '25 April 2022',
        site: undefined,
        submitted: null,
        updatedAt: '2022-04-25T14:10:14.861Z',
        licences: []
      }
    ])
  })

  it('if theres no application id, it wont hit the api', async () => {
    const mockFindByUser = jest.fn(() => [
      { updatedAt: '2022-03-25T14:10:14.861Z' }
    ])
    const mockGetTags = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        SITE: {
          getApplicationSitesByUserId: jest.fn()
        },
        APPLICATION: {
          tags: () => {
            return {
              getAll: mockGetTags
            }
          },
          findByUser: mockFindByUser
        }
      }
    }))
    const mockGetData = jest.fn(() => ({ userId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
    const { getData } = await import('../applications.js')
    const request = {
      cache: () => ({
        getData: mockGetData
      })
    }
    await getData(request)
    expect(mockGetData).toHaveBeenCalled()
    expect(mockGetTags).not.toHaveBeenCalled()
  })

  it('should redirect to species page when no applications found', async () => {
    const mockRedirect = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({ userId: '123abc' })
      })
    }
    const h = {
      redirect: mockRedirect
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          findByUser: () => []
        }
      }
    }))
    const { checkData } = await import('../applications.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/which-species')
  })

  it('should return null when an applications found', async () => {
    const mockRedirect = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({ userId: '123abc' })
      })
    }
    const h = {
      redirect: mockRedirect
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          findByUser: () => [
            {
              id: '9179c2f2-6eec-43d6-899b-6504d6a1e798',
              updatedAt: '2022-04-25T14:10:14.861Z',
              submitted: '2022-04-25T14:10:14.861Z'
            }
          ]
        }
      }
    }))
    const { checkData } = await import('../applications.js')
    expect(await checkData(request, h)).toBeNull()
  })
})
