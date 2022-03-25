/*
 * Mock the hapi request object
 */
const path = 'user/uuid'
const req = { path, payload: { } }

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
const context = { request: { params: {} } }

jest.mock('@defra/wls-database-model')

let models
let postUser
let cache

const applicationJson = 'application/json'
describe('The postUser handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postUser = (await import('../post-user')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.users = {
      findAll: jest.fn(() => []),
      findByPk: jest.fn(() => ({ id: 'bar', ...ts })),
      create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.save = jest.fn()
    await postUser(context, { payload: { username: 'Graham' } }, h)
    expect(models.users.create).toHaveBeenCalledWith({ id: expect.any(String), username: 'Graham' })
    expect(cache.save).toHaveBeenCalledWith('/user/bar', { id: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 400 with a duplicate username', async () => {
    models.users = {
      findAll: jest.fn(() => [{ dataValues: {} }]),
      findByPk: jest.fn(() => ({ id: 'bar', ...ts })),
      create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.save = jest.fn()
    await postUser(context, { payload: { username: 'Graham' } }, h)
    expect(models.users.create).not.toHaveBeenCalled()
    expect(cache.save).not.toHaveBeenCalledWith()
    expect(h.response).toHaveBeenCalledWith(expect.objectContaining({ code: 400 }))
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(400)
  })

  it('throws with a create query error', async () => {
    models.users = { create: jest.fn(async () => { throw Error() }) }
    await expect(async () => {
      await postUser(context, req, h)
    }).rejects.toThrow()
  })
})
