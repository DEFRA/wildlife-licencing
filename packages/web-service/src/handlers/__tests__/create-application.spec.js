
describe('the create-application handler function', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the API and saves the journey data', async () => {
    const mockGetData = jest.fn(() => ({ userId: 'afda812d-c4df-4182-9978-19e6641c4a6e' }))
    const mockSetData = jest.fn()
    const mockCreate = jest.fn(() => ({ id: '90846065-09cb-4396-ba87-5fbe8e78ae41' }))
    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          create: mockCreate
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: mockGetData,
        setData: mockSetData
      })
    }
    const mockRedirect = jest.fn(() => 'next')
    const h = {
      redirect: mockRedirect
    }
    const createApplication = (await import('../create-application.js')).default
    const result = await createApplication(request, h)
    expect(mockGetData).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e', 'A24 Badger')
    expect(mockSetData).toHaveBeenCalledWith({
      applicationId: '90846065-09cb-4396-ba87-5fbe8e78ae41',
      userId: 'afda812d-c4df-4182-9978-19e6641c4a6e'
    })
    expect(result).toEqual('next')
  })
})
