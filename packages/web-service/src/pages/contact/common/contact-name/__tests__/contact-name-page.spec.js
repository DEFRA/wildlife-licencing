
describe('contact-name page', () => {
  beforeEach(() => jest.resetModules())
  it('the validator rejects because it finds duplicate name', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: r => ({
            findByUser: jest.fn()
              .mockReturnValue(r === 'APPLICANT' ? [{ fullName: 'Keith Moon' }] : [{ fullName: 'John Entwistle' }]),
            getByApplicationId: jest.fn().mockReturnValue({ fullName: 'Roger Daltrey' })
          })
        }
      }
    }))
    const payload = {
      name: 'keith  moon'
    }
    const { getValidator } = await import('../contact-name-page.js')
    const validator = getValidator('APPLICANT', ['APPLICANT', 'ADDITIONAL-APPLICANT'])
    await expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator rejects because the duplicate name is the current name', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: r => ({
            findByUser: jest.fn()
              .mockReturnValue(r === 'APPLICANT' ? [{ fullName: 'Keith Moon' }] : [{ fullName: 'John Entwistle' }]),
            getByApplicationId: jest.fn().mockReturnValue({ fullName: 'Roger Daltrey' })
          })
        }
      }
    }))
    const payload = {
      name: 'Roger  daltrey'
    }
    const { getValidator } = await import('../contact-name-page.js')
    const validator = getValidator('APPLICANT', ['APPLICANT', 'ADDITIONAL-APPLICANT'])
    await expect(() => validator(payload, {})).resolves
  })

  it('the validator works as expected with duplicate authorized persons', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => [{ fullName: 'Keith Moon' }, { fullName: 'Pete Townsend' }])
          })
        }
      }
    }))
    const payload = {
      name: 'Keith Moon'
    }
    const { getValidator } = await import('../contact-name-page.js')
    const validator = getValidator('AUTHORISED-PERSON', ['AUTHORISED-PERSON'])
    await expect(() => validator(payload, {})).rejects.toThrow()
  })
})
