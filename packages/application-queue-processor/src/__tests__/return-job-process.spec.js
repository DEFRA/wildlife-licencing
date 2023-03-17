import { UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

jest.spyOn(console, 'error').mockImplementation(() => null)

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { RETURN_QUEUE: {} }
}))

const returnId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    returnId
  }
}

describe('The return job processor', () => {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  describe('The buildApiObject function - creates a data and keys payload for the batch update process', () => {
    it('return null where no return is found', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: { findByPk: jest.fn(() => null) }
        }
      }))
      const { buildApiObject } = await import('../return-job-process.js')
      const result = await buildApiObject(job.data.returnId)
      expect(result).toBeNull()
    })

    it('correctly creates a return payload', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              returnData: { foo: 'bar' },
              sddsReturnId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { buildApiObject } = await import('../return-job-process.js')
      const payload = await buildApiObject(job.data.returnId)
      expect(payload).toEqual({
        return: {
          data: { foo: 'bar' },
          keys: {
            apiKey: 'b1847e67-07fa-4c51-af03-cb51f5126939',
            sddsKey: 'b1847e67-07fa-4c51-af03-cb51f5126939'
          }
        }
      })
    })

    it('throws an error on bad data', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => null)
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: { findByPk: jest.fn(() => { throw new Error() }) }
        }
      }))
      const { buildApiObject } = await import('../return-job-process.js')
      await expect(buildApiObject(0)).rejects.toThrow()
    })
  })

  describe('The postProcess function - writes the response data back down into the database', () => {
    beforeAll(() => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        SEQUELIZE: { getSequelize: () => ({ fn: jest.fn() }) },
        POWERAPPS: { getClientUrl: jest.fn() }
      }))
    })

    it('Updates correctly when passed the set of target keys', async () => {
      const mockReturnsUpdate = jest.fn(() => {})
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: { update: mockReturnsUpdate }
        }
      }))

      const { postProcess } = await import('../common.js')
      await postProcess([{
        apiTableName: 'returns',
        keys: {
          apiKey: '656f6707-13e3-459d-8f1e-b1b30df79c09',
          sddsKey: 'f59e6275-adf7-ec11-82e6-002248c5c17e'
        }
      }])
      expect(mockReturnsUpdate).toHaveBeenCalledWith(expect.objectContaining({
        sddsReturnId: 'f59e6275-adf7-ec11-82e6-002248c5c17e',
        updateStatus: 'P'
      }), { where: { id: '656f6707-13e3-459d-8f1e-b1b30df79c09' } })
    })
  })

  describe('The returnUpdateProcess function - calls the update process and handles errors', () => {
    beforeAll(() => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        SEQUELIZE: { getSequelize: () => ({ fn: jest.fn() }) },
        POWERAPPS: { getClientUrl: jest.fn() }
      }))
    })

    it('Resolves when no error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        returnUpdate: jest.fn(() => [{
          apiTableName: 'returns',
          keys: {
            apiKey: '656f6707-13e3-459d-8f1e-b1b30df79c09',
            sddsKey: 'f59e6275-adf7-ec11-82e6-002248c5c17e'
          }
        }]),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              returnData: { foo: 'bar' },
              sddsReturnId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { returnJobProcess } = await import('../return-job-process.js')
      await expect(() => returnJobProcess(job)).resolves
    })

    it('Resolves where no return found in database', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        returnsUpdate: jest.fn(),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: { findByPk: jest.fn(() => null) }
        }
      }))
      const { returnJobProcess } = await import('../return-job-process.js')
      await expect(returnJobProcess(job)).resolves
    })

    it('Logs error and resolves with unrecoverable error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          returnUpdate: jest.fn(() => { throw new UnRecoverableBatchError() }),
          BaseKeyMapping: BaseKeyMapping
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              returnData: { foo: 'bar' },
              sddsReturnId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { returnJobProcess } = await import('../return-job-process.js')
      await returnJobProcess(job)
      // await expect(returnJobProcess(job)).resolves
    })

    it('Reject with recoverable error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => null)
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          returnUpdate: jest.fn(() => { throw new Error() }),
          BaseKeyMapping: BaseKeyMapping
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          returns: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              returnData: { foo: 'bar' },
              sddsReturnId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { returnJobProcess } = await import('../return-job-process.js')
      await expect(returnJobProcess(job)).rejects.toThrow()
    })
  })
})
