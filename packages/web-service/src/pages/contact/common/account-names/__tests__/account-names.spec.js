import { contactURIs } from '../../../../../uris.js'

describe('the account-names functions', () => {
  beforeEach(() => jest.resetModules())

  describe('accountNamesCheckData', () => {
    it('returns to is-organisations if there is no available account', async () => {
      jest.doMock('../../common.js', () => ({
        hasAccountCandidates: () => false
      }))

      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
            }),
            isImmutable: () => false
          },
          ACCOUNT: {
            role: () => ({
              findByUser: jest.fn(() => [])
            })
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const h = {
        redirect: jest.fn()
      }
      const { accountNamesCheckData } = await import('../account-names.js')
      await accountNamesCheckData('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-organisation')
    })

    it('returns null if there are available accounts', async () => {
      jest.doMock('../../common.js', () => ({
        hasAccountCandidates: () => true
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
            })
          },
          ACCOUNT: {
            role: () => ({
              findByUser: jest.fn(() => [{
                id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
                name: 'The Who'
              }])
            }),
            isImmutable: () => false
          }
        }
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const h = {
        redirect: jest.fn()
      }
      const { accountNamesCheckData } = await import('../account-names.js')
      const result = await accountNamesCheckData('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request, h)
      expect(result).toBeNull()
    })
  })

  describe('getAccountNamesData', () => {
    it('returns the contact, the account and the accounts for the user', async () => {
      jest.doMock('../../common.js', () => ({
        getAccountCandidates: () => [
          { id: 'a39f4e35-9e06-4585-b52a-c4144d94f7f7', name: 'Led Zeppelin' },
          { id: 'b39f4e35-9e06-4585-b52a-c4144d94f7f7', name: 'Yes' },
          { id: 'c39f4e35-9e06-4585-b52a-c4144d94f7f7', name: 'The Who' }
        ]
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
            })
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ name: 'The Who' }))
            }),
            isImmutable: () => false
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const { getAccountNamesData } = await import('../account-names.js')
      const result = await getAccountNamesData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        contact: { fullName: 'Keith Moon' },
        account: { name: 'The Who' },
        accounts: [
          { id: 'a39f4e35-9e06-4585-b52a-c4144d94f7f7', name: 'Led Zeppelin' },
          { id: 'b39f4e35-9e06-4585-b52a-c4144d94f7f7', name: 'Yes' },
          { id: 'c39f4e35-9e06-4585-b52a-c4144d94f7f7', name: 'The Who' }
        ]
      })
    })
  })

  describe('setAccountNamesData', () => {
    it('if existing account selected assign it to the application', async () => {
      const mockSetOrganisation = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../operations.js', () => ({
        accountOperations: () => ({
          assign: mockAssign
        }),
        contactAccountOperations: () => ({
          setOrganisation: mockSetOrganisation
        })
      }))

      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        }),
        payload: {
          account: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }
      }
      const { setAccountNamesData } = await import('../account-names.js')
      await setAccountNamesData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(mockSetOrganisation).toHaveBeenCalledWith(true)
      expect(mockAssign).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c')
    })
  })

  describe('accountNamesCompletion', () => {
    it('if \'none\' is selected returns is-organisation', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: { account: 'new' }
          })),
          clearPageData: jest.fn()
        })
      }
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-organisation')
    })

    it('if an existing, submitted account is selected returns check-answers', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: { account: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          })),
          clearPageData: jest.fn()
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ submitted: '2022-08-17T11:00:30.297Z' }))
            }),
            isImmutable: () => false
          }
        }
      }))
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-email')
    })

    it('if an existing, un-submitted account is selected returns the email page', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: { account: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          })),
          clearPageData: jest.fn()
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({}))
            }),
            isImmutable: () => false
          }
        }
      }))
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-email')
    })
  })
})
