describe('the email-address-page', () => {
  beforeEach(() => jest.resetModules())

  it('the validator throws an error on an invalid email address', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ }))
          })
        },
        ACCOUNT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ }))
          })
        }
      }
    }))
    const payload = {
      'email-address': 'no.an.email.address',
      'change-email': 'yes'
    }
    const { getValidator } = await import('../email-address-page.js')
    const validator = getValidator('APPLICANT', null)
    await expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator throws an error on a duplicate email address', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ }))
          })
        },
        ACCOUNT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ contactDetails: { email: 'keith@thewho.co.uk' } }))
          })
        }
      }
    }))
    const payload = {
      'email-address': 'keith@thewho.co.uk',
      'change-email': 'yes'
    }
    const { getValidator } = await import('../email-address-page.js')
    const validator = getValidator('APPLICANT', 'APPLICANT-ORGANISATION')
    await expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator does not throws an errorwith no change', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ }))
          })
        },
        ACCOUNT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ contactDetails: { email: 'keith@thewho.co.uk' } }))
          })
        }
      }
    }))
    const payload = {
      'email-address': 'anything',
      'change-email': 'no'
    }
    const { getValidator } = await import('../email-address-page.js')
    const validator = getValidator('APPLICANT', 'APPLICANT-ORGANISATION')
    await expect(() => validator(payload, {})).resolves
  })
})
