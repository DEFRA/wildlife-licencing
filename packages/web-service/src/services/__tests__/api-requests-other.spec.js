jest.spyOn(console, 'error').mockImplementation(code => {})

describe('The API requests other service', () => {
  describe('OTHER requests', () => {
    beforeEach(() => jest.resetModules())
    it('rest calls the API correctly', async () => {
      const mockPost = jest.fn().mockReturnValueOnce([])
      jest.doMock('@defra/wls-connectors-lib', () => ({
        API: {
          post: mockPost
        }
      }))
      const { APIRequests } = await import('../api-requests.js')
      await APIRequests.OTHER.reset('email@email.com')
      expect(mockPost).toHaveBeenCalledWith('/reset', { username: 'email@email.com' })
    })
  })
})
