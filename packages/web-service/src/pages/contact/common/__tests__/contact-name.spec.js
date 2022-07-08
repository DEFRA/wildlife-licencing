describe('contact-name', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the contact from the database', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
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
    const { getContactData } = await import('../contact-name/contact-name.js')
    const exampleGetContactData = getContactData('APPLICANT')
    const result = await exampleGetContactData(request)
    expect(result).toEqual({ fullName: 'Keith Richards' })
  })

  it('setData sets the contact in the database', async () => {
    const mockCreate = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
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
    const { setContactData } = await import('../contact-name/contact-name.js')
    const exampleSetContactData = setContactData('APPLICANT')
    await exampleSetContactData(request)
    expect(mockCreate).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb', { fullName: 'Keith Richards' })
  })
})
