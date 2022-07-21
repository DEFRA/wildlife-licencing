/*
 * Mock the hapi request object
 */
const path = 'user/uuid/application'
const req = {
  path,
  payload: {
    proposalDescription: 'a proposal',
    detailsOfConvictions: 'convictions',
    applicationTypeId: '9d62e5b8-9c77-ec11-8d21-000d3a87431b',
    applicationPurposeId: '3db073af-201b-ec11-b6e7-0022481a8f18'
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
const context = { request: { params: { userId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } } }

jest.mock('@defra/wls-database-model')

let models
let postApplication
let cache
const applicationJson = 'application/json'

describe('The postApplication handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postApplication = (await import('../post-application.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.applications = { create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } })) }
    models.applicationTypeApplicationPurposes = { findOne: jest.fn(() => ({})) }
    cache.save = jest.fn(() => null)
    cache.delete = jest.fn(() => null)
    await postApplication(context, req, h)
    expect(models.applications.create).toHaveBeenCalledWith({
      id: expect.any(String),
      updateStatus: 'L',
      application: (({ ...l }) => l)(req.payload)
    })
    expect(cache.save).toHaveBeenCalledWith('/application/bar', { id: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns 409 with an invalid type-purpose', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.applicationTypeApplicationPurposes = { findOne: jest.fn(() => null) }
    await postApplication(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('throws with an insert error', async () => {
    cache.save = jest.fn(() => null)
    cache.delete = jest.fn(() => null)
    models.applicationTypeApplicationPurposes = { findOne: jest.fn(() => ({})) }
    models.applications = { create: jest.fn(async () => { throw new Error() }) }
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await expect(async () => {
      await postApplication(context, req, h)
    }).rejects.toThrow()
  })
})
