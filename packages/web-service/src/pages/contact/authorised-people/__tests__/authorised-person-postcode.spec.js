describe('authorised person postcode', () => {
  beforeEach(() => jest.resetModules())
  describe('the setData function', () => {
    it('sets the postcode correctly', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            getById: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              fullName: 'Peter Hammill',
              contactDetails: { email: 'Peter.Hammill@vandergrafgenerator.co.uk' },
              address: 'address'
            }),
            isImmutable: () => false,
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: {
          postcode: 'BS9 1HK'
        },
        cache: () => ({
          clearPageData: jest.fn(),
          setData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
            authorisedPeople: { contactId: '35acb529-70bb-4b8d-8688-ccdec837e5d4' }
          }))
        })
      }
      const { setData } = await import('../authorised-person-postcode.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('35acb529-70bb-4b8d-8688-ccdec837e5d4', { address: { postcode: 'BS9 1HK' }, contactDetails: { email: 'Peter.Hammill@vandergrafgenerator.co.uk' }, fullName: 'Peter Hammill' })
    })
  })
})
