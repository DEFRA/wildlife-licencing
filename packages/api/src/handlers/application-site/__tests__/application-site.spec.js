/*
 * Mock the hapi request object
 */

const APPLICATION_ID = '4f2b56c5-1d2c-4a4b-b4ad-e4a1ac90d5c8'
const SITE_ID = '5d152a82-067b-4162-831e-c5b5e19cff7f'
const USER_ID = '8d1adfa1-8451-4109-a71c-9f7aa516a3f1'
const APPLICATION_SITE_ID = '4b0ccdd8-53af-414e-9f2a-a9c61493ab97'

const path = 'user/8d1adfa1-8451-4109-a71c-9f7aa516a3f1/application-site'
const req = {
  path,
  payload: {
    applicationId: APPLICATION_ID,
    siteId: SITE_ID
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { userId: USER_ID } } }

jest.mock('@defra/wls-database-model')

let models
let cache
const applicationJson = 'application/json'

describe('The postApplicationSite handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    cache.save = jest.fn(() => null)
    cache.delete = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applications = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.sites = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applicationSites = {
      findOne: jest.fn(async () => null),
      create: jest.fn(() => ({
        dataValues: {
          userId: USER_ID,
          siteId: SITE_ID,
          applicationId: APPLICATION_ID,
          id: APPLICATION_SITE_ID,
          updateStatus: 'L',
          sddsApplicationSiteId: null,
          submitted: null,
          ...ts
        }
      }))
    }
    const postApplicationSite = (await import('../post-application-site.js')).default
    await postApplicationSite(context, req, h)
    expect(models.applicationSites.create).toHaveBeenCalledWith({
      applicationId: APPLICATION_ID,
      id: expect.any(String),
      siteId: SITE_ID,
      updateStatus: 'L',
      userId: USER_ID
    })
    expect(cache.save).toHaveBeenCalledWith(`/user/${USER_ID}/application-site/${APPLICATION_SITE_ID}`, expect.any(Object))
    expect(cache.delete).toHaveBeenCalledWith(`/user/${USER_ID}/application-sites`)
    expect(h.response).toHaveBeenCalledWith(expect.objectContaining({
      applicationId: APPLICATION_ID,
      id: APPLICATION_SITE_ID,
      siteId: SITE_ID,
      ...tsR
    }))
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a conflict and error if the user-application-site already exists', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applications = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.sites = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applicationSites = {
      findOne: jest.fn(async () => ({ dataValues: { id: 'bar' } }))
    }
    const postApplicationSite = (await import('../post-application-site.js')).default
    await postApplicationSite(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      code: 409,
      error: {
        description: expect.any(String)
      }
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('returns a bad request and error if the site does not exist', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applications = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.sites = { findByPk: jest.fn(async () => null) }
    const postApplicationSite = (await import('../post-application-site.js')).default
    await postApplicationSite(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      code: 400,
      error: {
        description: expect.any(String)
      }
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a bad request and error if the application does not exist', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applications = { findByPk: jest.fn(async () => null) }
    const postApplicationSite = (await import('../post-application-site.js')).default
    await postApplicationSite(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      code: 400,
      error: {
        description: expect.any(String)
      }
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('returns a bad request if the user does not exist', async () => {
    models.users = { findByPk: jest.fn(async () => null) }
    const postApplicationSite = (await import('../post-application-site.js')).default
    await postApplicationSite(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('throws with any model error', async () => {
    models.users = { findByPk: jest.fn(async () => { throw new Error() }) }
    const postApplicationSite = (await import('../post-application-site.js')).default
    await expect(async () => {
      await postApplicationSite(context, req, h)
    }).rejects.toThrow()
  })
})
