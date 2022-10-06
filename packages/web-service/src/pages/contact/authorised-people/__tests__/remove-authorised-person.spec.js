describe('remove authorised person', () => {
  beforeEach(() => jest.resetModules())
  describe('the setData function', () => {
    it('', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({ getByApplicationId: jest.fn(() => ({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' })) })
          }
        }
      }))
      const request = {
        cache: () => ({ getData: jest.fn(() => ({})) })
      }
      const { setData } = await import('../remove-authorised-person.js')
      await setData(request)
    })
  })
})
