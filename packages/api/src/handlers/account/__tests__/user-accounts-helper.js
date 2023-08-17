/*
 * Mock the hapi request object
 */
const path = 'accounts'
jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const applicationJson = 'application/json'

const result = [
  {
    id: '69689b9b-8b16-4a7c-9055-8fb792f683f4',
    cloneOf: null,
    name: 'account-name',
    applicationId: '316881a8-b3a8-4656-a693-eb7772cee366',
    accountRole: 'ECOLOGIST-ORGANISATION',
    updatedAt: new Date('2022-06-20T15:03:49.269Z'),
    submitted: new Date('2022-06-20T15:03:49.269Z')
  }
]

describe('The userAccountsHelper handler', () => {
  beforeEach(() => jest.resetModules())
  it('returns an array of results and status 200 from the database', async () => {
    const mockQuery = jest.fn(() => result)
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const userAccountsHelper = (await import('../user-accounts-helper.js'))
      .default
    await userAccountsHelper(
      {},
      { query: { userId: '1a17b038-b4b2-470b-a695-f53ad7cc214b' }, path },
      h
    )
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        "user_id = '1a17b038-b4b2-470b-a695-f53ad7cc214b'"
      ),
      { type: '' }
    )
    expect(h.response).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '69689b9b-8b16-4a7c-9055-8fb792f683f4'
      })
    ])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    const mockQuery = jest.fn(() => {
      throw new Error()
    })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const userAccountsHelper = (await import('../user-accounts-helper.js'))
      .default
    await expect(async () => {
      await userAccountsHelper(
        {},
        { query: { userId: '1a17b038-b4b2-470b-a695-f53ad7cc214b' } },
        {}
      )
    }).rejects.toThrow()
  })
})
