describe('the is-organisation functions', () => {
  beforeEach(() => jest.resetModules())

  describe('getContactAccountData', () => {
    it('returns the contact and account data for the role', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          },
          APPLICANT_ORGANISATION: {
            getByApplicationId: jest.fn(() => ({ fullName: 'The Who' }))
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const { getContactAccountData } = await import('../is-organisation.js')
      const result = await getContactAccountData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
      expect(result).toEqual({
        account: {
          fullName: 'The Who'
        },
        contact: {
          fullName: 'Keith Moon'
        }
      })
    })
  })

  describe('setContactAccountData', () => {
    it('assigns an account if the user returns \'yes\'', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            create: mockCreate
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          }))
        })
      }
      const { setContactAccountData } = await import('../is-organisation.js')
      await setContactAccountData('APPLICANT_ORGANISATION')(request)
      expect(mockCreate).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', { name: 'The Who' })
    })
    it('un-assigns an account if the user returns \'no\'', async () => {
      const mockUnAssign = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            unAssign: mockUnAssign
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          }))
        })
      }
      const { setContactAccountData } = await import('../is-organisation.js')
      await setContactAccountData('APPLICANT_ORGANISATION')(request)
      expect(mockUnAssign).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7')
    })
  })

  describe('contactAccountCompletion', () => {
    it('returns the email address page if the user has selected \'yes\' (new) ', async () => {
      const urlBase = { EMAIL: { uri: '/applicant-email' } }
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'yes',
              'organisation-name': 'The Who'
            }
          }))
        })
      }
      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', urlBase)(request)
      expect(result).toEqual('/applicant-email')
    })
    it('returns the check-answers page if the user answers \'no\' and the selected contact has already been submitted ', async () => {
      const urlBase = { CHECK_ANSWERS: { uri: '/applicant-check-answers' } }
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({ submitted: '2022-08-17T11:00:30.297Z' }))
          }
        }
      }))
      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', urlBase)(request)
      expect(result).toEqual('/applicant-check-answers')
    })
    it('returns the email page if the user answers \'no\' and the selected contact is not yet submitted ', async () => {
      const urlBase = { EMAIL: { uri: '/applicant-email' } }
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          })),
          getPageData: jest.fn(() => ({
            payload: {
              'is-organisation': 'no'
            }
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getByApplicationId: jest.fn(() => ({}))
          }
        }
      }))
      const { contactAccountCompletion } = await import('../is-organisation.js')
      const result = await contactAccountCompletion('APPLICANT', urlBase)(request)
      expect(result).toEqual('/applicant-email')
    })
  })
})
