
describe('is-organisation page', () => {
  beforeEach(() => jest.resetModules())
  it('the validator works as expected with negative result', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              get: () => null
            }
          }
        }
      }
    }))
    const payload = {
      'is-organisation': 'yes',
      'organisation-name': 'The Rolling Stones'
    }
    const { getValidator } = await import('../is-organisation-page')
    const validator = getValidator('APPLICANT_ORGANISATION')
    await expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator works as expected with positive result', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        ACCOUNT: {
          role: () => ({
            findByUser: jest.fn(() => [{ name: 'The Stones' }])
          })
        }
      }
    }))
    const payload = {
      'is-organisation': 'yes',
      'organisation-name': 'The Rolling Stones'
    }
    const { getValidator } = await import('../is-organisation-page')
    const validator = getValidator('APPLICANT_ORGANISATION')
    await expect(() => validator(payload, {})).resolves
  })

  it('the validator works as expected with non-duplicate single account', async () => {
    jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => ({
        getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
      })
    }))
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        ACCOUNT: {
          role: () => ({
            findByUser: jest.fn(() => [{ name: 'The Jimi Hendrix Experience' }, { name: 'The Rolling Stones' }]),
            getByApplicationId: jest.fn(() => ({ name: 'The Rolling Stones' }))
          })
        }
      }
    }))
    const payload = {
      'is-organisation': 'yes',
      'organisation-name': 'The Rolling Stones'
    }
    const { getValidator } = await import('../is-organisation-page')
    const validator = getValidator('APPLICANT_ORGANISATION')
    await expect(() => validator(payload, {})).resolves
    const payload2 = {
      'is-organisation': 'yes',
      'organisation-name': 'The Jimi Hendrix Experience'
    }
    await expect(() => validator(payload2, {})).rejects.toThrow()
  })
})
