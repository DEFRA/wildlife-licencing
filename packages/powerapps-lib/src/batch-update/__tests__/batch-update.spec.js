describe('The batch query update', () => {
  beforeEach(() => jest.resetModules())

  it('makes the correct lower level call to the connectors library', async () => {
    const mockBatchRequest = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => {
      return {
        POWERAPPS: {
          getClientUrl: jest.fn(),
          batchRequest: mockBatchRequest
        }
      }
    })
    jest.doMock('../batch-formation.js', () => ({
      openBatchRequest: () => ({ batchId: 'batch123' }),
      createBatchRequest: jest.fn(),
      createKeyObject: jest.fn()
    }))
    const { batchUpdate } = await import('../batch-update.js')
    await batchUpdate({ }, {})
    expect(mockBatchRequest).toHaveBeenCalled()
  })

  it.each([
    [401, 'Unauthorized'],
    [408, 'Timeout'],
    [500, 'Server error']])('throws recoverable batch error on http response %i', async status => {
    const originalModule = jest.requireActual('@defra/wls-connectors-lib')
    const HTTPResponseError = originalModule.POWERAPPS.HTTPResponseError
    const mockBatchRequest = jest.fn(() => {
      throw new HTTPResponseError({ ok: false, status })
    })

    jest.doMock('@defra/wls-connectors-lib', () => {
      return {
        POWERAPPS: {
          getClientUrl: jest.fn(() => 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'),
          batchRequest: mockBatchRequest,
          HTTPResponseError
        }
      }
    })

    const { batchUpdate, RecoverableBatchError } = await import('../batch-update.js')
    await expect(async () => await batchUpdate({}, {}))
      .rejects.toThrowError(RecoverableBatchError)
  })

  it.each([
    [400, 'Bad request'],
    [404, 'Not found']
  ])('throws unrecoverable batch error on http response %i', async status => {
    const originalModule = jest.requireActual('@defra/wls-connectors-lib')
    const HTTPResponseError = originalModule.POWERAPPS.HTTPResponseError
    const mockBatchRequest = jest.fn(() => {
      throw new HTTPResponseError({ ok: false, status })
    })

    jest.doMock('@defra/wls-connectors-lib', () => {
      return {
        POWERAPPS: {
          getClientUrl: jest.fn(() => 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'),
          batchRequest: mockBatchRequest,
          HTTPResponseError
        }
      }
    })

    const { batchUpdate, UnRecoverableBatchError } = await import('../batch-update.js')
    await expect(async () => await batchUpdate({ }, {}))
      .rejects.toThrowError(UnRecoverableBatchError)
  })

  it('throws recoverable batch error on general error', async () => {
    const originalModule = jest.requireActual('@defra/wls-connectors-lib')
    const HTTPResponseError = originalModule.POWERAPPS.HTTPResponseError
    const mockBatchRequest = jest.fn(() => {
      throw new Error()
    })
    jest.doMock('@defra/wls-connectors-lib', () => {
      return {
        POWERAPPS: {
          getClientUrl: jest.fn(() => 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'),
          batchRequest: mockBatchRequest,
          HTTPResponseError
        }
      }
    })
    const { batchUpdate, RecoverableBatchError } = await import('../batch-update.js')
    await expect(async () => await batchUpdate({ }, {}))
      .rejects.toThrowError(RecoverableBatchError)
  })
})
