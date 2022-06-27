describe('account', () => {
  beforeEach(() => jest.resetModules())
  it('getContactAccountData returns the contact and contact account from the database', async () => {
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT: {
          getByApplicationId: jest.fn(() => ({ fullName: 'Bloggs' }))
        },
        APPLICANT_ORGANIZATION: {
          getByApplicationId: jest.fn(() => ({ name: '123 Ltd.' }))
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
    const { getContactAccountData } = await import('../account.js')
    const exampleGetAccountData = getContactAccountData('APPLICANT', 'APPLICANT_ORGANIZATION')
    const result = await exampleGetAccountData(request)
    expect(result).toEqual({
      contact: {
        fullName: 'Bloggs'
      },
      account: {
        name: '123 Ltd.'
      }
    })
  })

  it('setContactAccountData writes the contact account to the database', async () => {
    const mockCreate = jest.fn()
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT_ORGANIZATION: {
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
          payload: {
            'is-organization': 'yes',
            'organization-name': 'XYZ ltd.'
          }
        }))
      })
    }

    const { setContactAccountData } = await import('../account.js')
    const exampleSetAccountData = setContactAccountData('APPLICANT_ORGANIZATION')
    await exampleSetAccountData(request)
    expect(mockCreate).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb', { name: 'XYZ ltd.' })
  })

  it('setContactAccountData removes the applicant organization from the database', async () => {
    const mockUnAssign = jest.fn()
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICANT_ORGANIZATION: {
          unAssign: mockUnAssign
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
          payload: {
            'is-organization': 'no'
          }
        }))
      })
    }
    const { setContactAccountData } = await import('../account.js')
    const exampleSetAccountData = setContactAccountData('APPLICANT_ORGANIZATION')
    await exampleSetAccountData(request)

    expect(mockUnAssign).toHaveBeenCalledWith('dad9d73e-d591-41df-9475-92c032bd3ceb')
  })
})
