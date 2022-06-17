/*
 * Mock the hapi request object
 */
const path = 'account'
const req = {
  path,
  payload: {
    name: 'Blogs and Co.'
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
const context = { request: { } }

jest.mock('@defra/wls-database-model')

let models
let postAccount
let cache
const applicationJson = 'application/json'

describe('The postAccount handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postAccount = (await import('../post-account.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.accounts = { create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts, account: {} } })) }
    cache.save = jest.fn(() => null)
    await postAccount(context, req, h)
    expect(models.accounts.create).toHaveBeenCalledWith({
      id: expect.any(String),
      updateStatus: 'L',
      account: (({ ...l }) => l)(req.payload)
    })
    expect(cache.save).toHaveBeenCalledWith('/account/bar', { id: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('throws with an insert error', async () => {
    cache.save = jest.fn(() => null)
    models.accounts = { create: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await postAccount(context, req, h)
    }).rejects.toThrow()
  })
})
