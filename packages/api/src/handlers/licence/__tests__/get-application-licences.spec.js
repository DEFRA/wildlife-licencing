const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77'
    }
  }
}

jest.mock('@defra/wls-database-model')

let models
let getApplicationLicences
let cache
const applicationJson = 'application/json'

describe('The GetApplicationLicences handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getApplicationLicences = (await import('../get-application-licences.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 200 on successful fetch from the cache', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' }))
    }
    cache.restore = jest.fn(() => JSON.stringify([{
      id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
      applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
      endDate: '2022-08-26',
      startDate: '2022-08-10',
      licenceNumber: 'LI-0016N0Z4',
      createdAt: '2021-12-07T09:50:04.666Z',
      updatedAt: '2021-12-07T09:50:04.666Z'
    }]))
    cache.save = jest.fn()
    await getApplicationLicences(context, {}, h)
    expect(h.response).toHaveBeenCalledWith([{
      applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
      createdAt: '2021-12-07T09:50:04.666Z',
      endDate: '2022-08-26',
      id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
      licenceNumber: 'LI-0016N0Z4',
      startDate: '2022-08-10',
      updatedAt: '2021-12-07T09:50:04.666Z'
    }
    ])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 on successful fetch from the database', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' }))
    }
    models.licences = {
      findAll: jest.fn(async () => [{
        dataValues: {
          id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
          applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
          licence: {
            endDate: '2022-08-26T00:00:00Z',
            startDate: '2022-08-10T00:00:00Z',
            licenceNumber: 'LI-0016N0Z4'
          },
          createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
          updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
        }
      }])
    }
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    await getApplicationLicences(context, {}, h)
    expect(h.response).toHaveBeenCalledWith([{
      applicationId: 'd9c9aec7-3e86-441b-bc49-87009c00a605',
      createdAt: '2021-12-07T09:50:04.666Z',
      endDate: '2022-08-26',
      id: '7eabe3f9-8818-ed11-b83e-002248c5c45b',
      licenceNumber: 'LI-0016N0Z4',
      startDate: '2022-08-10',
      updatedAt: '2021-12-07T09:50:04.666Z'
    }
    ])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on application not found', async () => {
    models.applications = {
      findByPk: jest.fn(() => null)
    }
    cache.restore = jest.fn(() => null)
    await getApplicationLicences(context, {}, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an error', async () => {
    models.applications = { create: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await getApplicationLicences(context, { }, h)
    }).rejects.toThrow()
  })
})
