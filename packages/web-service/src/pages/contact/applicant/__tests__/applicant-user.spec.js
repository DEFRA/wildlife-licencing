import { contactURIs } from '../../../../uris.js'
const { USER, NAME } = contactURIs.APPLICANT

describe('applicant-user', () => {
  beforeEach(() => jest.resetModules())
  describe('completion', () => {
    it('returns the USER page if YES', async () => {
      const { completion } = await import('../applicant-user.js')
      const mockGetPageData = jest.fn(() => ({ payload: { 'yes-no': 'yes' } }))
      const request = {
        cache: () => ({ getPageData: mockGetPageData })
      }
      const result = await completion(request)
      expect(result).toEqual(USER.uri)
    })
    it('returns the NAME page if NO', async () => {
      const { completion } = await import('../applicant-user.js')
      const mockGetPageData = jest.fn(() => ({ payload: { 'yes-no': 'no' } }))
      const request = {
        cache: () => ({ getPageData: mockGetPageData })
      }
      const result = await completion(request)
      expect(result).toEqual(NAME.uri)
    })
  })
})
