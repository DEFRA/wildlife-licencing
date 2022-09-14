import { contactURIs } from '../../../../../uris.js'

describe('the account-names functions', () => {
  beforeEach(() => jest.resetModules())

  describe('accountNamesCheckData', () => {
    it('returns to is-organisations if there is no available account', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          },
          APPLICANT_ORGANISATION: {
            findByUser: jest.fn(() => [])
          },
          ACCOUNT: {
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
      await accountNamesCheckData('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applicant-organisation')
    })

    it('returns null if there are available accounts', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          },
          APPLICANT_ORGANISATION: {
            findByUser: jest.fn(() => [{
              id: '35a6c59e-0faf-438b-b4d5-6967d8d075cb',
              name: 'The Who'
            }])
          },
          ACCOUNT: {
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
      const result = await accountNamesCheckData('APPLICANT', 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request, h)
      expect(result).toBeNull()
    })
  })

  describe('getAccountNamesData', () => {
    it('returns the contact, the account and the accounts for the user', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ name: 'The Who' })),
            findByUser: jest.fn(() => [{ name: 'Led Zeppelin' }, { fullName: 'Yes' }, { fullName: 'The Who' }])
          },
          ACCOUNT: {
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
        accounts: [{ name: 'Led Zeppelin' }, { fullName: 'Yes' }, { fullName: 'The Who' }]
      })
    })
  })

  describe('setAccountNamesData', () => {
    it('if existing account selected assign it to the application', async () => {
      const mockAssign = jest.fn()
      jest.doMock('../../common.js', () => ({
        accountOperations: () => ({
          assign: mockAssign
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
      expect(mockAssign).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c')
    })

    it('if \'none\' is selected un-assign any existing account from the organisation', async () => {
      const mockUnAssign = jest.fn()
      jest.doMock('../../common.js', () => ({
        accountOperations: () => ({
          unAssign: mockUnAssign
        })
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        }),
        payload: {
          account: 'new'
        }
      }
      const { setAccountNamesData } = await import('../account-names.js')
      await setAccountNamesData('APPLICANT_ORGANISATION')(request)
      expect(mockUnAssign).toHaveBeenCalledWith()
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
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ submitted: '2022-08-17T11:00:30.297Z' }))
          }
        }
      }))
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-check-answers')
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
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({}))
          }
        }
      }))
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-email')
    })
  })
})
