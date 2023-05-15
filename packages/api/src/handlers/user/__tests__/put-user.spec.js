/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
jest.spyOn(console, 'error').mockImplementation(() => null)

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { userId: 'uid' } } }

jest.mock('@defra/wls-database-model')

let models
let putUser
let cache

const applicationJson = 'application/json'
describe('The putUser handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    putUser = (await import('../put-user')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
    cache.save = jest.fn()
  })

  it('returns status 200 on a successful update', async () => {
    models.users = {
      update: jest.fn(() => [1, [{ dataValues: { id: 'bar', ...ts } }]])
    }
    await putUser(context, { payload: { username: 'Graham', password: 'password' } }, h)
    expect(models.users.update).toHaveBeenCalledWith({
      password: expect.any(String)
    }, { returning: true, where: { id: 'uid' } })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns status 404 on a not found', async () => {
    models.users = { update: jest.fn(() => [0, []]) }
    await putUser(context, { payload: { username: 'Graham', password: 'password' } }, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns status 200 with no password given', async () => {
    await putUser(context, { payload: { } }, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws with a create update error', async () => {
    models.users = { update: jest.fn(async () => { throw Error() }) }
    await expect(() => putUser(context, { payload: { username: 'Graham', password: 'password' } }, h)).rejects.toThrow()
  })
})
