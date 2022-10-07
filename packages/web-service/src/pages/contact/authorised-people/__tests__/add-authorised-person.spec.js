describe('add authorised person', () => {
  beforeEach(() => jest.resetModules())
  describe('the checkData function', () => {
    it('redirects to the name page with no name', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => [{
                id: 'dad9d73e-d591-41df-9475-92c032bd3ceb'
              }])
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          setData: jest.fn(),
          clearPageData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { checkData } = await import('../add-authorised-person.js')
      const h = { redirect: jest.fn() }
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/authorised-person-name')
    })
    it('redirects to the email page with no email', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => [{
                id: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
                fullName: 'Peter Hammill'
              }])
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          setData: jest.fn(),
          clearPageData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { checkData } = await import('../add-authorised-person.js')
      const h = { redirect: jest.fn() }
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/authorised-person-email')
    })

    it('redirects to the postcode page with no address', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => [{
                id: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
                fullName: 'Peter Hammill',
                contactDetails: { email: 'Peter.Hammil@vandergrafgenerator' }
              }])
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          setData: jest.fn(),
          clearPageData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { checkData } = await import('../add-authorised-person.js')
      const h = { redirect: jest.fn() }
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/authorised-person-postcode')
    })
  })

  describe('the getData function ', () => {
    it('returns the check-answers data correctly', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => [{
                id: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
                fullName: 'Peter Hammill',
                contactDetails: { email: 'Peter.Hammil@vandergrafgenerator' },
                address: {
                  postcode: 'BS32 8IU'
                }
              }])
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { getData } = await import('../add-authorised-person.js')
      const results = await getData(request)
      expect(results).toEqual({
        contacts:
          [{
            details: [{ key: 'name', value: 'Peter Hammill' },
              { key: 'address', value: 'BS32 8IU' },
              { key: 'email', value: 'Peter.Hammil@vandergrafgenerator' }],
            uri: {
              address: '/authorised-person-postcode?id=dad9d73e-d591-41df-9475-92c032bd3ceb',
              email: '/authorised-person-email?id=dad9d73e-d591-41df-9475-92c032bd3ceb',
              name: '/authorised-person-name?id=dad9d73e-d591-41df-9475-92c032bd3ceb',
              remove: '/remove-authorised-person?id=dad9d73e-d591-41df-9475-92c032bd3ceb'
            }
          }]
      })
    })
  })

  describe('the setData function ', () => {
    it('when adding another removes the tag', async () => {
      const mockRemove = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              remove: mockRemove
            })
          }
        }
      }))

      const request = {
        payload: {
          'yes-no': 'yes'
        },
        cache: () => ({
          clearPageData: jest.fn(),
          setData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { setData } = await import('../add-authorised-person.js')
      await setData(request)
      expect(mockRemove).toHaveBeenCalledWith('authorised-person-contact-complete')
    })

    it('when not adding another contact adds the tag', async () => {
      const mockAdd = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              add: mockAdd
            })
          }
        }
      }))

      const request = {
        payload: {
          'yes-no': 'no'
        },
        cache: () => ({
          clearPageData: jest.fn(),
          setData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { setData } = await import('../add-authorised-person.js')
      await setData(request)
      expect(mockAdd).toHaveBeenCalledWith('authorised-person-contact-complete')
    })
  })

  describe('the completion function ', () => {
    it('when not adding another contact it returns the tasklist', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({
            payload: {
              'yes-no': 'no'
            }
          })),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { completion } = await import('../add-authorised-person.js')
      const result = await completion(request)
      expect(result).toEqual('/tasklist')
    })

    it('when adding another contact it returns the name page', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({
            payload: {
              'yes-no': 'yes'
            }
          })),
          getData: jest.fn(() => ({
            userId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { completion } = await import('../add-authorised-person.js')
      const result = await completion(request)
      expect(result).toEqual('/authorised-person-name')
    })
  })
})
