/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      userId: 'aac6b84d-0407-4f45-bb7e-ec855228fae6'
    }
  }
}

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

jest.mock('@defra/wls-database-model')

let models
let getApplicationAccounts
const applicationJson = 'application/json'

describe('The getApplicationAccounts handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getApplicationAccounts = (await import('../get-application-accounts.js'))
      .default
  })

  it('returns an array of application-accounts and status 200', async () => {
    models.applicationAccounts = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplicationAccounts(context, { query: {} }, h)
    expect(models.applicationAccounts.findAll).toHaveBeenCalled()
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of application-accounts and status 200 - with an applicationId filter', async () => {
    models.applicationAccounts = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplicationAccounts(
      context,
      { query: { applicationId: '123' } },
      h
    )
    expect(models.applicationAccounts.findAll).toHaveBeenCalledWith({
      where: { applicationId: '123' }
    })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of application-accounts and status 200 - with a role filter', async () => {
    models.applicationAccounts = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplicationAccounts(context, { query: { role: 'APPLICANT' } }, h)
    expect(models.applicationAccounts.findAll).toHaveBeenCalledWith({
      where: { accountRole: 'APPLICANT' }
    })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    models.applicationAccounts = {
      findAll: jest.fn(() => {
        throw new Error()
      })
    }
    await expect(async () => {
      await getApplicationAccounts(context, { query: {} }, h)
    }).rejects.toThrow()
  })
})
