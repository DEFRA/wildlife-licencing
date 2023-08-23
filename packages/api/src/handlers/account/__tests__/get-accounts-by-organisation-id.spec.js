/*
 * Mock the hapi request object
 */
const path = '/accounts-by-org/uuid'
const req = { path }

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn(() => ({ response: 'toolkit' }))
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      organisationId: '1bfe075b-377e-472b-b160-a6a454648e23'
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
let getAccounts
const applicationJson = 'application/json'
describe('The getContactsByOrganisationId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getAccounts = (await import('../get-accounts-by-organisation-id.js')).default
  })

  it('returns accounts and status 200 from the database', async () => {
    models.accounts = { findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }]) }
    await getAccounts(context, req, h)
    expect(models.accounts.findAll).toHaveBeenCalledWith({ where: { organisationId: '1bfe075b-377e-472b-b160-a6a454648e23' } })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    models.accounts = { findAll: jest.fn(() => { throw new Error() }) }
    const getAccounts = (await import('../get-accounts.js')).default
    await expect(async () => {
      await getAccounts({ }, { query: {} }, h)
    }).rejects.toThrow()
  })
})
