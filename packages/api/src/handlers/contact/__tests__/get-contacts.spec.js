/*
 * Mock the hapi request object
 */
const path = 'contacts'

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
    contact: { fullName: 'contact 1' },
    sdds_contact_id: null,
    submitted: null,
    update_status: 'L',
    created_at: new Date('2022-06-20T15:03:49.269Z'),
    updated_at: new Date('2022-06-20T15:03:49.269Z')
  }
]

describe('The getContacts handler', () => {
  beforeEach(() => jest.resetModules())
  it('returns an array of contacts and status 200 from the database', async () => {
    const mockQuery = jest.fn(() => result)
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const getContacts = (await import('../get-contacts.js')).default
    await getContacts({ }, { query: { }, path }, h)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('where ac.application_id = au.application_id'), expect.any(Object))
    expect(h.response).toHaveBeenCalledWith([expect.objectContaining({
      id: '69689b9b-8b16-4a7c-9055-8fb792f683f4',
      createdAt: '2022-06-20T15:03:49.269Z',
      updatedAt: '2022-06-20T15:03:49.269Z',
      fullName: 'contact 1'
    })])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('applies the userId filter to the query', async () => {
    const mockQuery = jest.fn(() => result)
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const getContacts = (await import('../get-contacts.js')).default
    await getContacts({ }, { query: { userId: '123' }, path }, h)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('and au.user_id = \'123\''), expect.any(Object))
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('applies the applicationId filter to the query', async () => {
    const mockQuery = jest.fn(() => result)
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const getContacts = (await import('../get-contacts.js')).default
    await getContacts({ }, { query: { applicationId: '123' }, path }, h)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('and ac.application_id = \'123\''), expect.any(Object))
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('applies the role filter to the query', async () => {
    const mockQuery = jest.fn(() => result)
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const getContacts = (await import('../get-contacts.js')).default
    await getContacts({ }, { query: { role: 'ECOLOGIST' }, path }, h)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('and ac.contact_role = \'ECOLOGIST\''), expect.any(Object))
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    const mockQuery = jest.fn(() => { throw new Error() })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { SELECT: '' }
        })
      }
    }))
    const getContacts = (await import('../get-contacts.js')).default
    await expect(async () => {
      await getContacts({ }, { query: {} }, h)
    }).rejects.toThrow()
  })
})
