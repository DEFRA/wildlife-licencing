import { contactURIs } from '../../../../../uris.js'

describe('contact-names', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkContactNames function', () => {
    it('returns to the applications page if no applicationId is set', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca'
          }))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkContactNamesData } = await import('../contact-names.js')
      await checkContactNamesData('APPLICANT', contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })
  })

  describe('the getContactNamesData function', () => {
    it('will return all of the contacts for the user and a contact assigned to the application', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }]),
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          },
          CONTACT: {
            isImmutable: () => false
          }
        }
      }))
      const { getContactNamesData } = await import('../contact-names.js')
      const exampleGetContactNamesData = getContactNamesData('APPLICANT')
      const result = await exampleGetContactNamesData(request)
      expect(result).toEqual({
        contact: { fullName: 'Keith Moon' },
        contacts: [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }]
      })
    })
  })

  describe('the setContactNamesData function', () => {
    it('does nothing if the user chooses \'none of these\'', async () => {
      const mockAssign = jest.fn()
      jest.doMock('../../common.js', () => ({
        contactOperations: () => ({
          assign: mockAssign
        })
      }))

      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: 'new' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        }),
        payload: {
          contact: 'new'
        }
      }

      const { setContactNamesData } = await import('../contact-names.js')
      const exampleSetContactNamesData = setContactNamesData('APPLICANT')
      await exampleSetContactNamesData(request)
      expect(mockAssign).not.toHaveBeenCalled()
    })

    it('assigns contact to the application if the user chooses an existing contact', async () => {
      const mockAssign = jest.fn()
      jest.doMock('../../common.js', () => ({
        contactOperations: () => ({
          assign: mockAssign
        })
      }))

      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: 'new' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        }),
        payload: {
          contact: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
        }
      }

      const { setContactNamesData } = await import('../contact-names.js')
      const exampleSetContactNamesData = setContactNamesData('APPLICANT')
      await exampleSetContactNamesData(request)
      expect(mockAssign).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7')
    })
  })

  describe('the contactNamesCompletion function', () => {
    it('will return the name page if the contact is new', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: 'new' } })),
          clearPageData: jest.fn(),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-name')
    })

    it('check page visited, no account, no contactDetails returns the email page', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => null)
          },
          APPLICATION: {
            tags: () => ({
              has: () => true
            })
          },
          CONTACT: {
            getById: () => ({ id: '7c3b13ef-c2fb-4955-942e-764593cf0ada' })
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-email')
    })

    it('check page visited, no account, no address returns the postcode page', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => null)
          },
          APPLICATION: {
            tags: () => ({
              has: () => true
            })
          },
          CONTACT: {
            getById: () => ({
              id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
              contactDetails: { email: 'John.Entwistle@who.co.uk' }
            })
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-postcode')
    })

    it('check page visited, no account, with address returns the check page', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => null)
          },
          APPLICATION: {
            tags: () => ({
              has: () => true
            })
          },
          CONTACT: {
            getById: () => ({
              id: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
              contactDetails: { email: 'John.Entwistle@who.co.uk' },
              address: 'Address'
            })
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('check page visited, with account, returns the check page', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({
              id: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
            }))
          },
          APPLICATION: {
            tags: () => ({
              has: () => true
            })
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('check page not visited, has accounts available, return the organisations page', async () => {
      jest.dontMock('../../common.js') // Because the top level reset does not apply on this level
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            findByUser: jest.fn(() => [{ id: '1c3e7655-bb74-4420-9bf0-0bd710987f10', name: 'The Who' }])
          },
          APPLICATION: {
            tags: () => ({
              has: () => false
            })
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-organisations')
    })

    it('check page not visited, no accounts available, return the organisations page', async () => {
      jest.dontMock('../../common.js') // Because the top level reset does not apply on this level
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          })),
          clearPageData: jest.fn()
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            findByUser: jest.fn(() => [])
          },
          APPLICATION: {
            tags: () => ({
              has: () => false
            })
          },
          ACCOUNT: {
            isImmutable: () => false
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-organisation')
    })
  })
})
