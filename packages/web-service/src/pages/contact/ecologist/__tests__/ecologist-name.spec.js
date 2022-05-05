
describe('ecologist-name', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the ecologist from the database', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST: {
          getById: jest.fn(() => ({ fullName: 'Keith Richards' }))
        }
      }
    }))
    const { getData } = await import('../ecologist-name.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        }))
      })
    }
    const result = await getData(request)
    expect(result).toEqual({ fullName: 'Keith Richards' })
  })

  it('setData returns the ecologist from the database', async () => {
    const mockPutById = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST: {
          getById: jest.fn(() => ({ fullName: 'Keith Richards' })),
          putById: mockPutById
        }
      }
    }))
    const { setData } = await import('../ecologist-name.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        })),
        getPageData: jest.fn(() => ({
          payload: { name: 'Keith Richards' }
        }))
      })
    }
    await setData(request)
    expect(mockPutById).toHaveBeenCalledWith('658c78d4-8890-4f79-a008-08fade8326d6',
      'dad9d73e-d591-41df-9475-92c032bd3ceb', { fullName: 'Keith Richards' })
  })
})
