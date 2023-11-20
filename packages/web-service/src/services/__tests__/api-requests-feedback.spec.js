jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests feedback service', () => {
  beforeEach(() => jest.resetModules())

  it('createFeedback calls the API correctly', async () => {
    const mockPost = jest.fn().mockReturnValueOnce({ id: 1 })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      API: {
        post: mockPost
      }
    }))

    const postData = {
      howCanWeImproveThisService: 'Some text',
      rating: 'Satisfied',
      userId: '1234'
    }

    const { APIRequests } = await import('../api-requests.js')
    await APIRequests.FEEDBACK.createFeedback(postData)
    expect(mockPost).toHaveBeenCalledWith('/feedback', postData)
  })
})
