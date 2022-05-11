describe('the submit-application handler function', () => {
  beforeEach(() => jest.resetModules())

  it('correctly calls the API and submits the journey data', async () => {
    const mockGetData = jest.fn(() => ({
      userId: 'afda812d-c4df-4182-9978-19e6641c4a6e',
      applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
    }))
    const request = {
      cache: () => ({
        getData: mockGetData
      })
    }
    const mockSubmit = jest.fn()
    jest.doMock('../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          submit: mockSubmit
        }
      }
    }))
    const mockRedirect = jest.fn(() => 'next')
    const h = {
      redirect: mockRedirect
    }
    const submitApplication = (await import('../submit-application.js')).default
    const result = await submitApplication(request, h)
    expect(mockGetData).toHaveBeenCalledTimes(1)
    expect(mockSubmit).toHaveBeenCalledWith('afda812d-c4df-4182-9978-19e6641c4a6e',
      '35a6c59e-0faf-438b-b4d5-6967d8d075cb')
    expect(result).toEqual('next')
  })
})
