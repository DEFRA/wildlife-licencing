describe('applications page', () => {
  beforeEach(() => jest.resetModules())

  it('recalls the applications for a user', async () => {
    const mockFindByUser = jest.fn(() => [
      { id: '8179c2f2-6eec-43d6-899b-6504d6a1e798', updatedAt: '2022-03-25T14:10:14.861Z' }
    ])
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              getAll: () => []
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
    const result = await getData(request)
    expect(mockGetData).toHaveBeenCalled()
    expect(mockFindByUser).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e')
    expect(result).toEqual(expect.objectContaining({
      applications: [
        {
          id: '8179c2f2-6eec-43d6-899b-6504d6a1e798',
          lastSaved: '25 March 2022',
          statusValue: '0 of 12 sections completed',
          updatedAt: '2022-03-25T14:10:14.861Z',
          submitted: null
        }]
    }))
  })

  it('if theres no application id, it wont hit the api', async () => {
    const mockFindByUser = jest.fn(() => [
      { updatedAt: '2022-03-25T14:10:14.861Z' }
    ])
    const mockGetTags = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
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
})
