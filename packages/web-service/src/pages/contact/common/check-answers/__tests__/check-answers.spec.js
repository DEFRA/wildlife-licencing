describe('the check-answers page', () => {
  beforeEach(() => jest.resetModules())

  it('getCheckAnswersData fetch data with account', async () => {
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => ({
            add: jest.fn()
          })
        },
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ fullName: 'Keith Richards' }))
          })
        },
        ACCOUNT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({
              name: 'The Rolling Stones',
              address: { postcode: 'SW1W 0NY' },
              contactDetails: { email: 'keith@therollingstones.com' }
            }))
          })
        }
      }
    }))
    const { getCheckAnswersData } = await import('../check-answers.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
          applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
        }))
      }),
      payload: {}
    }
    const result = await getCheckAnswersData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
    expect(result).toEqual({
      checkYourAnswers: [
        {
          key: 'contactIsUser',
          value: '-'
        },
        {
          key: 'whoIsTheLicenceFor',
          value: 'Keith Richards'
        },
        {
          key: 'contactIsOrganisation',
          value: 'yes'
        },
        {
          key: 'contactOrganisations',
          value: 'The Rolling Stones'
        },
        {
          key: 'address',
          value: 'SW1W 0NY'
        },
        {
          key: 'email',
          value: 'keith@therollingstones.com'
        }
      ],
      hasAccount: true
    })
  })

  it('getCheckAnswersData fetch data without account', async () => {
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => ({
            add: jest.fn()
          })
        },
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({
              fullName: 'Keith Richards',
              address: { postcode: 'SW1W 0NY' },
              contactDetails: { email: 'keith@therollingstones.com' },
              userId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
            }))
          })
        },
        ACCOUNT: {
          role: () => ({
            getByApplicationId: jest.fn(() => null)
          })
        }
      }
    }))
    const { getCheckAnswersData } = await import('../check-answers.js')
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
          applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
        }))
      }),
      payload: {}
    }
    const result = await getCheckAnswersData('APPLICANT', 'APPLICANT_ORGANISATION')(request)
    expect(result).toEqual({
      checkYourAnswers: [
        {
          key: 'contactIsUser',
          value: 'yes'
        },
        {
          key: 'whoIsTheLicenceFor',
          value: 'Keith Richards'
        },
        {
          key: 'contactIsOrganisation',
          value: 'no'
        },
        {
          key: 'address',
          value: 'SW1W 0NY'
        },
        {
          key: 'email',
          value: 'keith@therollingstones.com'
        }
      ],
      hasAccount: false
    })
  })
})
