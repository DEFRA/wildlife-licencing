import { APPLICATIONS } from '../../../../uris.js'

describe('contact common', () => {
  beforeEach(() => jest.resetModules())
  describe('checkData', () => {
    it('returns redirect to the application page if applicationId is not set', async () => {
      const { checkData } = await import('../common.js')
      const request = {
        cache: () => ({ getData: jest.fn(() => ({})) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      const result = await checkData(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith(APPLICATIONS.uri)
    })

    it('returns null if applicationId is set', async () => {
      const { checkData } = await import('../common.js')
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ applicationId: '64154be7-35d3-480b-ae97-38331605bf28' })) })
      }
      const h = {}
      const result = await checkData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('checkData', () => {
    it('getUserData returns the applicant user from the database', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn(() => ({ username: 'Mick Jagger' }))
          }
        }
      }))
      const { getUserData } = await import('../../common/common.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '658c78d4-8890-4f79-a008-08fade8326d6'
          }))
        })
      }
      const result = await getUserData(request)
      expect(result).toEqual({ username: 'Mick Jagger' })
    })
  })
})
