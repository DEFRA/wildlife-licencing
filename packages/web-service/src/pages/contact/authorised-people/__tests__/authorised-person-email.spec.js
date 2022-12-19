describe('authorised person email', () => {
  beforeEach(() => jest.resetModules())
  describe('the ofContact function', () => {
    it('returns page data', async () => {
      const { ofContact } = await import('../authorised-person-email.js')
      const contact = {
        fullName: 'name',
        contactDetails: { email: 'a@b.c' }
      }
      const result = await ofContact(contact)
      expect(result).toEqual({
        contactName: 'name',
        email: 'a@b.c'
      })
    })
  })

  describe('the setData function', () => {
    it('sets the email address on the contact', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            getById: () => ({
              id: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
              fullName: 'Peter Hammill',
              address: 'address'
            }),
            isImmutable: () => false,
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: {
          'email-address': 'Peter.Hammill@vandergrafgenerator.co.uk'
        },
        cache: () => ({
          setData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
            authorisedPeople: { contactId: '35acb529-70bb-4b8d-8688-ccdec837e5d4' }
          }))
        })
      }
      const { setData } = await import('../authorised-person-email.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('35acb529-70bb-4b8d-8688-ccdec837e5d4',
        { address: 'address', contactDetails: { email: 'Peter.Hammill@vandergrafgenerator.co.uk' }, fullName: 'Peter Hammill' })
    })
  })
})
