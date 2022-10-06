describe('authorised person address', () => {
  beforeEach(() => jest.resetModules())
  describe('the setData function', () => {
    it('sets the address on the contact', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            getById: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              fullName: 'Peter Hammill',
              contactDetails: { email: 'Peter.Hammill@vandergrafgenerator.co.uk' },
              address: {
                uprn: 123,
                postcode: 'BS9 1HK'
              }
            }),
            isImmutable: () => false,
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: {
          uprn: 123
        },
        cache: () => ({
          setData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
            authorisedPeople: { contactId: '35acb529-70bb-4b8d-8688-ccdec837e5d4' },
            addressLookup: [{
              Address: {
                UPRN: '123',
                Street: 'Hill View Road.'
              }
            }]
          }))
        })
      }

      const { setData } = await import('../authorised-person-address.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('35acb529-70bb-4b8d-8688-ccdec837e5d4', {
        address: { street: 'Hill View Road.', uprn: '123' },
        contactDetails: { email: 'Peter.Hammill@vandergrafgenerator.co.uk' },
        fullName: 'Peter Hammill'
      })
    })
  })
})
