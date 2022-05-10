import { APPLICATIONS, contactURIs } from '../../../../uris.js'
const { ECOLOGIST: { NAME } } = contactURIs

describe('ecologist-names', () => {
  beforeEach(() => jest.resetModules())
  describe('the ecologistNamesCheckData function', () => {
    it('will return a redirect to the applications page if no application has been set', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({})) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      const { ecologistNamesCheckData } = await import('../ecologist-names.js')
      const result = await ecologistNamesCheckData(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith(APPLICATIONS.uri)
    })

    it('will return a redirect to the name page if there are no ecologists for this user', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ userId: '412d7297-643d-485b-8745-cc25a0e6ec0a', applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST: {
            findByUser: jest.fn(() => null)
          }
        }
      }))
      const { ecologistNamesCheckData } = await import('../ecologist-names.js')
      const result = await ecologistNamesCheckData(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith(NAME.uri)
    })

    it('will return undefined if there are ecologists for this user', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ userId: '412d7297-643d-485b-8745-cc25a0e6ec0a', applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }])
          }
        }
      }))
      const { ecologistNamesCheckData } = await import('../ecologist-names.js')
      const result = await ecologistNamesCheckData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('the getEcologistNamesData function', () => {
    it('will return an array of sorted unique ecologist names and an Id create using base64', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ userId: '412d7297-643d-485b-8745-cc25a0e6ec0a' })) })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }])
          }
        }
      }))
      const { getEcologistNamesData } = await import('../ecologist-names.js')
      const result = await getEcologistNamesData(request)
      expect(result).toEqual([{ fullName: 'Charlie Watts', id: 'Q2hhcmxpZSBXYXR0cw==' }, { fullName: 'Keith Moon', id: 'S2VpdGggTW9vbg==' }])
    })
  })

  describe('the setEcologistNamesData function', () => {
    it('will do nothing if the user has elected to create a new ecologist', async () => {
      const request = {
        cache: () => ({ getPageData: jest.fn(() => ({ payload: { contact: 'new' } })) })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST: {
            putById: mockPutById
          }
        }
      }))
      const { setEcologistNamesData } = await import('../ecologist-names.js')
      await setEcologistNamesData(request)
      expect(mockPutById).not.toHaveBeenCalled()
    })

    it('update the ecologist section if a name is selected', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          })),
          getPageData: jest.fn(() => ({ payload: { contact: 'Q2hhcmxpZSBXYXR0cw==' } }))
        })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST: {
            getById: jest.fn(() => ({ foo: 'bar' })),
            putById: mockPutById
          }
        }
      }))
      const { setEcologistNamesData } = await import('../ecologist-names.js')
      await setEcologistNamesData(request)
      expect(mockPutById).toHaveBeenCalledWith('412d7297-643d-485b-8745-cc25a0e6ec0a',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', { foo: 'bar', fullName: 'Charlie Watts' })
    })
  })
})
