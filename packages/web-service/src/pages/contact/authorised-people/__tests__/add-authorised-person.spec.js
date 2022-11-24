import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'

describe('add authorised person', () => {
  beforeEach(() => jest.resetModules())
  describe('the checkData function', () => {
    it('redirects to the name page with no name', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
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
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
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
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
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
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn(),
                get: jest.fn()
              }
            }
          },
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
          })),
          clearPageData: jest.fn()
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

    it('calls the set() on the tags, when on the CYA page', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed',
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: mockSet,
              get: () => 'complete'
            })
          },
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
          })),
          clearPageData: jest.fn()
        })
      }
      const { getData } = await import('../add-authorised-person.js')
      await getData(request)
      expect(mockSet).toHaveBeenCalledTimes(1)
      expect(mockSet).toHaveBeenCalledWith({ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: 'complete-not-confirmed' })
    })
  })

  describe('the setData function ', () => {
    it('when adding another removes the tag', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress',
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: mockSet
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
      expect(mockSet).toHaveBeenCalledWith({ tag: 'authorised-people', tagState: 'in-progress' })
    })

    it('if you add no authorised people, journey marked as complete', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          IN_PROGRESS: 'in-progress',
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: mockSet
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
      expect(mockSet).toHaveBeenCalledWith({ tag: 'authorised-people', tagState: 'complete' })
    })

    it('when not adding another contact adds the tag', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: mockSet
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
      expect(mockSet).toHaveBeenCalledWith({ tag: 'authorised-people', tagState: 'complete' })
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
