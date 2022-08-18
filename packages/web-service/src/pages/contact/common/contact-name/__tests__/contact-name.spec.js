import { contactNameCompletion } from '../contact-name.js'

describe('contact-name', () => {
  beforeEach(() => jest.resetModules())
  it('getContactData returns a contact from the database', async () => {
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT: {
          getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        }))
      })
    }
    const { getContactData } = await import('../contact-name.js')
    const exampleGetContactData = getContactData('APPLICANT')
    const result = await exampleGetContactData(request)
    expect(result).toEqual({ fullName: 'Keith Richards' })
  })

  it('setContactData sets the contact in the database', async () => {
    const mockCreate = jest.fn()
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT: {
          create: mockCreate
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        })),
        getPageData: jest.fn(() => ({
          payload: { name: 'Keith Richards' }
        })),
        clearPageData: jest.fn()
      })
    }
    const { setContactData } = await import('../contact-name.js')
    const exampleSetContactData = setContactData('APPLICANT', {
      ORGANISATIONS: { page: 'applicant-organisations' },
      IS_ORGANISATION: { page: 'applicant-organisation' }
    })
    await exampleSetContactData(request)
    expect(mockCreate).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb', { fullName: 'Keith Richards' })
  })

  it('contactNameCompletion returns the organisations page if the user has existing accounts', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        }))
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT: {
          findByUser: jest.fn(() => [{ id: '09328cd0-65e7-4831-bb47-1ad3ee1d0069' }])
        }
      }
    }))
    const { contactNameCompletion } = await import('../contact-name.js')
    const exampleContactNameCompletion = contactNameCompletion('APPLICANT', {
      ORGANISATIONS: { uri: '/applicant-organisations' },
      IS_ORGANISATION: { uri: '/applicant-organisation' }
    })
    const result = await exampleContactNameCompletion(request)
    expect(result).toEqual('/applicant-organisations')
  })

  it('contactNameCompletion returns the organisation page if the user does not have any existing accounts', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: 'dad9d73e-d591-41df-9475-92c032bd3ceb',
          userId: '658c78d4-8890-4f79-a008-08fade8326d6'
        }))
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT: {
          findByUser: jest.fn(() => [])
        }
      }
    }))
    const { contactNameCompletion } = await import('../contact-name.js')
    const exampleContactNameCompletion = contactNameCompletion('APPLICANT', {
      ORGANISATIONS: { uri: '/applicant-organisations' },
      IS_ORGANISATION: { uri: '/applicant-organisation' }
    })
    const result = await exampleContactNameCompletion(request)
    expect(result).toEqual('/applicant-organisation')
  })
})
