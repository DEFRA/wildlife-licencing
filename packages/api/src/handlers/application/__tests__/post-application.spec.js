/*
 * Mock the hapi request object
 */
const path = 'user/uuid/application'
const req = {
  path,
  payload: {
    proposalDescription: 'a proposal',
    detailsOfConvictions: 'convictions'
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
    models.applications = { create: jest.fn(async () => ({ dataValues: { id: 'bar', userId: 'foo', ...ts } })) }
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    cache.save = jest.fn(() => null)
    cache.delete = jest.fn(() => null)
    await postApplication(context, req, h)
    expect(models.applications.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: context.request.params.userId,
      updateStatus: 'L',
      application: (({ ...l }) => l)(req.payload)
    })
    expect(cache.save).toHaveBeenCalledWith('/user/foo/application/bar', { id: 'bar', ...tsR })
    expect(cache.delete).toHaveBeenCalledWith(`/user/${context.request.params.userId}/applications`)
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 404 with an unknown userId', async () => {
    models.users = { findByPk: jest.fn(async () => null) }
    await postApplication(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    cache.save = jest.fn(() => null)
    cache.delete = jest.fn(() => null)
    models.applications = { create: jest.fn(async () => { throw new Error() }) }
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await expect(async () => {
      await postApplication(context, req, h)
    }).rejects.toThrow()
  })
})
