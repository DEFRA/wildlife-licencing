import { contactURIs } from '../../../../../uris.js'

describe('contact-name page', () => {
  beforeEach(() => jest.resetModules())

  describe('getContactData', () => {
    it('returns the contact', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' }))
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      const { getContactData } = await import('../contact-name.js')
      const result = await getContactData('APPLICANT')(request)
      expect(result).toEqual({ id: 'dad9d73e-d591-41df-9475-92c032bd3ceb' })
    })
  })

  describe('setContactData', () => {
    it('invokes the common operations correctly', async () => {
      const mockSetName = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactOperations: () => ({
          setName: mockSetName,
          create: jest.fn()
        })
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { setContactData } = await import('../contact-name.js')
      await setContactData('APPLICANT')(request)
      expect(mockSetName).toHaveBeenCalledWith('Ronnie Wood')
    })
  })

  describe('contactNameCompletion', () => {
    it('if an immutable account is associated return to the check your answers page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c' }))
            }),
            isImmutable: () => true
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { contactNameCompletion } = await import('../contact-name.js')
      const result = await contactNameCompletion('APPLICANT', 'APPLICANT_ORGANISATION', [], contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('if a mutable account is associated and no contact details are present, return to the email page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c' }))
            }),
            isImmutable: () => false
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { contactNameCompletion } = await import('../contact-name.js')
      const result = await contactNameCompletion('APPLICANT', 'APPLICANT_ORGANISATION', [], contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-email')
    })

    it('if a mutable account is associated and no address is present, return to the postcode page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
                contactDetails: { email: 'rwood@email.com' }
              }))
            }),
            isImmutable: () => false
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { contactNameCompletion } = await import('../contact-name.js')
      const result = await contactNameCompletion('APPLICANT', 'APPLICANT_ORGANISATION', [], contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-postcode')
    })

    it('if a mutable account is associated and an address is present, return to the check page', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({
                id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
                contactDetails: { email: 'rwood@email.com' },
                address: 'Address'
              }))
            }),
            isImmutable: () => false
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { contactNameCompletion } = await import('../contact-name.js')
      const result = await contactNameCompletion('APPLICANT', 'APPLICANT_ORGANISATION', [], contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
    })

    it('if a no account is associated and accounts are available, return to the organisations page', async () => {
      jest.doMock('../../common.js', () => ({ hasAccountCandidates: () => true }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            }),
            isImmutable: () => false
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { contactNameCompletion } = await import('../contact-name.js')
      const result = await contactNameCompletion('APPLICANT', 'APPLICANT_ORGANISATION', [], contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-organisations')
    })

    it('if a no account is associated and no accounts are available, return to the is organisation page', async () => {
      jest.doMock('../../common.js', () => ({ hasAccountCandidates: () => false }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            }),
            isImmutable: () => false
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        }),
        payload: {
          name: 'Ronnie Wood'
        }
      }
      const { contactNameCompletion } = await import('../contact-name.js')
      const result = await contactNameCompletion('APPLICANT', 'APPLICANT_ORGANISATION', [], contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-organisation')
    })
  })
})
