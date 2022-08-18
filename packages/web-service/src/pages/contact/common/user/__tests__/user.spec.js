
describe('the user functions', () => {
  beforeEach(() => jest.resetModules())
  it('getUserData', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' }))
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: jest.fn(() => ({ username: 'Keith Moon' }))
        }
      }
    }))
    const { getUserData } = await import('../user.js')
    const result = await getUserData('APPLICANT')(request)
    expect(result).toEqual({ username: 'Keith Moon' })
  })

  it('setUserData does nothing', async () => {
    const { setUserData } = await import('../user.js')
    expect(setUserData({})).not.toThrow()
  })

  describe('userCompletion', () => {
    it('returns the user page if \'yes\'', async () => {
      const { userCompletion } = await import('../user.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'yes' } }))
        })
      }
      const result = await userCompletion('APPLICANT', { USER: { uri: '/users' } })(request)
      expect(result).toEqual('/users')
    })

    it('returns the names page if \'no\' and the user has existing contacts', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'no' } }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }])
          }
        }
      }))
      const { userCompletion } = await import('../user.js')
      const result = await userCompletion('APPLICANT', { NAMES: { uri: '/names' } })(request)
      expect(result).toEqual('/names')
    })

    it('returns the name page if \'no\' and the user has no existing contacts', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'no' } }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [])
          }
        }
      }))
      const { userCompletion } = await import('../user.js')
      const result = await userCompletion('APPLICANT', { NAME: { uri: '/name' } })(request)
      expect(result).toEqual('/name')
    })
  })
})
