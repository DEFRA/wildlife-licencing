describe('remove authorised person', () => {
  beforeEach(() => jest.resetModules())
  describe('the setData function', () => {
    it('when yes, removes a contact', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            getById: jest.fn(() => ({ id: '35acb529-70bb-4b8d-8688-ccdec837e5d4' })),
            role: () => ({
              unLink: mockUnlink
            })
          }
        }
      }))
      const request = {
        payload: {
          'yes-no': 'yes'
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
      const { setData } = await import('../remove-authorised-person.js')
      await setData(request)
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '35acb529-70bb-4b8d-8688-ccdec837e5d4')
    })

    it('when no, does nothing', async () => {
      const request = {
        payload: {
          'yes-no': 'no'
        },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
            authorisedPeople: { contactId: '35acb529-70bb-4b8d-8688-ccdec837e5d4' }
          }))
        })
      }
      const { setData } = await import('../remove-authorised-person.js')
      await setData(request)
    })
  })
})
