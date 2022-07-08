import { APPLICATIONS, TASKLIST } from '../../../../uris.js'

describe('contact-names', () => {
  beforeEach(() => jest.resetModules())
  describe('the contactNamesCheckData function', () => {
    it('will return a redirect to the applications page if no application has been set', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({})) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => null)
          }
        }
      }))
      const { contactNamesCheckData } = await import('../contact-names/contact-names.js')
      const exampleContactNamesCheckData = contactNamesCheckData('APPLICANT')
      const result = await exampleContactNamesCheckData(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith(APPLICATIONS.uri)
    })

    it('will return a redirect to the name page if there are no contacts for this user', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ userId: '412d7297-643d-485b-8745-cc25a0e6ec0a', applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [])
          }
        }
      }))
      const { contactNamesCheckData } = await import('../contact-names/contact-names.js')
      const exampleContactNamesCheckData = contactNamesCheckData('APPLICANT')
      const result = await exampleContactNamesCheckData(request, h)
      expect(result).toEqual('redirect')
      expect(mockRedirect).toHaveBeenCalledWith('/applicant-name')
    })

    it('will return undefined if there are contacts for this user', async () => {
      const request = {
        cache: () => ({ getData: jest.fn(() => ({ userId: '412d7297-643d-485b-8745-cc25a0e6ec0a', applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })) })
      }
      const mockRedirect = jest.fn(() => 'redirect')
      const h = {
        redirect: mockRedirect
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }])
          }
        }
      }))
      const { contactNamesCheckData } = await import('../contact-names/contact-names.js')
      const exampleContactNamesCheckData = contactNamesCheckData('APPLICANT')
      const result = await exampleContactNamesCheckData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('the getContactNamesData function', () => {
    it('will return an array of sorted unique applicant names and an Id create using base64', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }]),
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          }
        }
      }))
      const { getContactNamesData } = await import('../contact-names/contact-names.js')
      const exampleGetContactNamesData = getContactNamesData('APPLICANT')
      const result = await exampleGetContactNamesData(request)
      expect(result).toEqual({
        contact: { fullName: 'Keith Moon' },
        contacts: [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }]
      })
    })
  })

  describe('the setContactNamesData function', () => {
    it('will do nothing if the user has elected to create a new contact', async () => {
      const request = {
        cache: () => ({ getPageData: jest.fn(() => ({ payload: { contact: 'new' } })) })
      }
      const mockPutById = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            putById: mockPutById
          }
        }
      }))
      const { setContactNamesData } = await import('../contact-names/contact-names.js')
      const exampleSetContactNamesData = setContactNamesData('APPLICANT')
      await exampleSetContactNamesData(request)
      expect(mockPutById).not.toHaveBeenCalled()
    })

    it('update the applicant section if a name is selected', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          })),
          getPageData: jest.fn(() => ({ payload: { contact: 'e8387a83-1165-42e6-afab-add01e77bc4c' } }))
        })
      }
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getById: jest.fn(() => ({ foo: 'bar' })),
            assign: mockAssign
          }
        }
      }))
      const { setContactNamesData } = await import('../contact-names/contact-names.js')
      const exampleSetContactNamesData = setContactNamesData('APPLICANT')
      await exampleSetContactNamesData(request)
      expect(mockAssign).toHaveBeenCalledWith('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', 'e8387a83-1165-42e6-afab-add01e77bc4c')
    })
  })

  describe('the completion function', () => {
    it('will return the NAME page if the contact is new', async () => {
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
      const mockUnassign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getById: jest.fn(() => ({ foo: 'bar' })),
            unAssign: mockUnassign
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names/contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT')
      const result = await exampleContactNamesCompletion(request)
      expect(mockUnassign).toHaveBeenCalledWith('56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(result).toEqual('/applicant-name')
    })
    it('will return the TASKLIST page if the contact is not new', async () => {
      const request = {
        cache: () => ({ getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })) })
      }
      const { contactNamesCompletion } = await import('../contact-names/contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT')
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual(TASKLIST.uri)
    })
  })
})
