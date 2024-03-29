describe('authorised person postcode', () => {
  beforeEach(() => jest.resetModules())

  describe('the ofContact function', () => {
    it('returns page data', async () => {
      const { ofContact } = await import('../authorised-person-postcode.js')
      const contact = {
        fullName: 'name',
        address: { postcode: 'BS27 2EU' }
      }
      const result = await ofContact(contact)
      expect(result).toEqual({
        contactName: 'name',
        postcode: 'BS27 2EU',
        uri: {
          addressForm: '/authorised-person-address-form?no-postcode=true'
        }
      })
    })
  })

  describe('the setData function', () => {
    const mockSetData = jest.fn()
    it('sets the postcode correctly', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        ADDRESS: {
          lookup: jest.fn(() => ({ results: [{ Address: { town: 'Bristol' } }] }))
        }
      }))
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress'
        },
        APIRequests: {
          CONTACT: {
            getById: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              fullName: 'Peter Hammill',
              contactDetails: { email: 'Peter.Hammill@vandergrafgenerator.co.uk' },
              address: 'address'
            }),
            isImmutable: () => false
          },
          APPLICATION: {
            tags: () => ({
              set: jest.fn()
            })
          }
        }
      }))
      const request = {
        payload: {
          postcode: 'BS9 1HK'
        },
        cache: () => ({
          setData: mockSetData,
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
            authorisedPeople: { contactId: '35acb529-70bb-4b8d-8688-ccdec837e5d4' }
          }))
        })
      }
      const { setData } = await import('../authorised-person-postcode.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith(expect.objectContaining({ addressLookup: [{ Address: { town: 'Bristol' } }] }))
    })
  })
})
