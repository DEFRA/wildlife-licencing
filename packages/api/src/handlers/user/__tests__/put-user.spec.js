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
const context = { request: { params: { userId: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb' } } }

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

  it('returns status 201 on a successful create', async () => {
    models.users = {
      findOrCreate: jest.fn(() => [{ dataValues: { id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', ...ts } }, true])
    }
    await putUser(context, { payload: { username: 'BA202321-H2-4706-N6-0607', email: 'a.b@c' } }, h)
    expect(models.users.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb',
        user: {
          email: 'a.b@c'
        },
        username: 'BA202321-H2-4706-N6-0607'
      },
      where: {
        id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'
      }
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns status 200 on a successful update', async () => {
    models.users = {
      findOrCreate: jest.fn(() => [{ dataValues: { id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', ...ts } }, false]),
      update: jest.fn(() => [1, [{ dataValues: { id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', ...ts } }]])
    }
    await putUser(context, { payload: { username: 'BA202321-H2-4706-N6-0607', email: 'a.b@c' } }, h)
    expect(models.users.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb',
        user: {
          email: 'a.b@c'
        },
        username: 'BA202321-H2-4706-N6-0607'
      },
      where: {
        id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb'
      }
    })
    expect(models.users.update).toHaveBeenCalledWith({ user: { email: 'a.b@c' } },
      { returning: true, where: { id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb' } })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns status 202 on a no-op', async () => {
    models.users = {
      findOrCreate: jest.fn(() => [{ dataValues: { id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb', ...ts } }, false])
    }
    await putUser(context, { payload: { username: 'BA202321-H2-4706-N6-0607' } }, h)
    expect(models.users.findOrCreate).toHaveBeenCalled()
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(202)
  })

  it('throws with a create update error', async () => {
    models.users = { findOrCreate: jest.fn(async () => { throw Error() }) }
    await expect(() => putUser(context, { payload: { username: 'BA202321-H2-4706-N6-0607' } }, h)).rejects.toThrow()
  })
})
