describe('the account-names functions', () => {
  beforeEach(() => jest.resetModules())

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
    it('if existing account selected assign it to the organisation', async () => {
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
      const mockAssign = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            assign: mockAssign
          }
        }
      }))
      const { setAccountNamesData } = await import('../account-names.js')
      await setAccountNamesData('APPLICANT_ORGANISATION')(request)
      expect(mockAssign).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
    })
    it('if \'none\' is selected un-assign any existing account from the organisation', async () => {
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
      const mockUnAssign = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            unAssign: mockUnAssign
          }
        }
      }))
      const { setAccountNamesData } = await import('../account-names.js')
      await setAccountNamesData('APPLICANT_ORGANISATION')(request)
      expect(mockUnAssign).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7')
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
      const urlBase = { IS_ORGANISATION: { uri: '/applicant-is-organisation', page: 'applicant-is-organisation' } }
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', urlBase)(request)
      expect(result).toEqual('/applicant-is-organisation')
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
      const urlBase = { CHECK_ANSWERS: { uri: '/applicant-check-answers', page: 'applicant-check-answers' } }
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', urlBase)(request)
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
      const urlBase = { EMAIL: { uri: '/applicant-email', page: 'applicant-email' } }
      const { accountNamesCompletion } = await import('../account-names.js')
      const result = await accountNamesCompletion('APPLICANT_ORGANISATION', urlBase)(request)
      expect(result).toEqual('/applicant-email')
    })
  })
})
