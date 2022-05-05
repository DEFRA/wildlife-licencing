const context = {
  request: {
    params: {
      userId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
    }
  }
}

describe('The getApplicantsByUserIdHandler handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns status 200 on a successful fetch from the cache', async () => {
    const mockRestore = jest.fn(() => JSON.stringify([{ fullName: 'Bob' }]))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: mockRestore
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({}))
    const { getApplicantsByUserId } = await import('../applicant.js')
    const request = {}
    const mockCode = jest.fn()
    const mockType = jest.fn(() => ({ code: mockCode }))
    const mockResponse = jest.fn(() => ({ type: mockType }))
    const h = { response: mockResponse }
    await getApplicantsByUserId(context, request, h)
    expect(mockResponse).toHaveBeenCalledWith([{ fullName: 'Bob' }])
    expect(mockType).toHaveBeenCalledWith('application/json')
    expect(mockCode).toHaveBeenCalledWith(200)
  })

  it('returns status 200 on a successful fetch from the database', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null),
          save: mockSave
        }
      }
    }))
    const mockFindAll = jest.fn(() => [{ dataValues: { application: { applicant: { fullName: 'Bob' } } } }])
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: mockFindAll
        }
      }
    }))
    const { getApplicantsByUserId } = await import('../applicant.js')
    const request = { path: 'path' }
    const mockCode = jest.fn()
    const mockType = jest.fn(() => ({ code: mockCode }))
    const mockResponse = jest.fn(() => ({ type: mockType }))
    const h = { response: mockResponse }
    await getApplicantsByUserId(context, request, h)
    expect(mockSave).toHaveBeenCalledWith('path', [{ fullName: 'Bob' }])
    expect(mockResponse).toHaveBeenCalledWith([{ fullName: 'Bob' }])
    expect(mockType).toHaveBeenCalledWith('application/json')
    expect(mockCode).toHaveBeenCalledWith(200)
  })

  it('throws on error', async () => {
    const mockRestore = jest.fn(() => { throw new Error() })
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: mockRestore
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({}))
    const { getApplicantsByUserId } = await import('../applicant.js')
    await expect(() => getApplicantsByUserId(context, { }, { })).rejects.toThrowError()
  })
})
