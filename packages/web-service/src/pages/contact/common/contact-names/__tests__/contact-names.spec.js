describe('contact-names', () => {
  beforeEach(() => jest.resetModules())

  describe('the getContactNamesData function', () => {
    it('will return all of the contacts for the user and a contact assigned to the application', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            findByUser: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }]),
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Moon' }))
          }
        }
      }))
      const { getContactNamesData } = await import('../contact-names.js')
      const exampleGetContactNamesData = getContactNamesData('APPLICANT')
      const result = await exampleGetContactNamesData(request)
      expect(result).toEqual({
        contact: { fullName: 'Keith Moon' },
        contacts: [{ fullName: 'Keith Moon' }, { fullName: 'Charlie Watts' }, { fullName: 'Keith Moon' }]
      })
    })
  })

  describe('the setContactNamesData function', () => {
    it('un-assigns contact from the application if the user chooses \'none of these\'', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: 'new' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const mockUnAssign = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            unAssign: mockUnAssign
          }
        }
      }))
      const { setContactNamesData } = await import('../contact-names.js')
      const exampleSetContactNamesData = setContactNamesData('APPLICANT')
      await exampleSetContactNamesData(request)
      expect(mockUnAssign).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7')
    })

    it('assigns contact to the application if the user chooses an existing contact', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '2342fce0-3067-4ca5-ae7a-23cae648e45c' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
          }))
        })
      }
      const mockAssign = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            assign: mockAssign
          }
        }
      }))
      const { setContactNamesData } = await import('../contact-names.js')
      const exampleSetContactNamesData = setContactNamesData('APPLICANT')
      await exampleSetContactNamesData(request)
      expect(mockAssign).toHaveBeenCalledWith('739f4e35-9e06-4585-b52a-c4144d94f7f7', '2342fce0-3067-4ca5-ae7a-23cae648e45c')
    })
  })

  describe('the contactNamesCompletion function', () => {
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
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT: {
            getById: jest.fn(() => ({ foo: 'bar' })),
            unAssign: mockUnassign
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION',
        { NAME: { uri: '/applicant-name', page: 'applicant-name' } })
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-name')
    })

    it('will return the organisations page if the user has organisations', async () => {
      const request = {
        cache: () => ({
          getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
          }))
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICANT_ORGANISATION: {
            findByUser: jest.fn(() => [{ foo: 'bar' }])
          }
        }
      }))
      const { contactNamesCompletion } = await import('../contact-names.js')
      const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION',
        { ORGANISATIONS: { uri: '/applicant-organisations', page: 'applicant-organisations' } })
      const result = await exampleContactNamesCompletion(request)
      expect(result).toEqual('/applicant-organisations')
    })
  })

  it('will return the (is) organisation page if the user has no organisations', async () => {
    const request = {
      cache: () => ({
        getPageData: jest.fn(() => ({ payload: { contact: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' } })),
        getData: jest.fn(() => ({
          userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
          applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
        })),
        clearPageData: jest.fn()
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT_ORGANISATION: {
          findByUser: jest.fn(() => [])
        }
      }
    }))
    const { contactNamesCompletion } = await import('../contact-names.js')
    const exampleContactNamesCompletion = contactNamesCompletion('APPLICANT', 'APPLICANT_ORGANISATION',
      { IS_ORGANISATION: { uri: '/applicant-organisation', page: 'applicant-organisation' } })
    const result = await exampleContactNamesCompletion(request)
    expect(result).toEqual('/applicant-organisation')
  })
})
