import { UnRecoverableBatchError, BaseKeyMapping } from '@defra/wls-powerapps-lib'

jest.spyOn(console, 'error').mockImplementation(() => null)

jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { RETURN_QUEUE: {} }
}))

const feedbackId = 'b1847e67-07fa-4c51-af03-cb51f5126939'

const job = {
  data: {
    feedbackId
  }
}

describe('The feedback job processor', () => {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  describe('The buildApiObject function - creates a data and keys payload for the batch update process', () => {
    it('return null where no return is found', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          feedbacks: { findByPk: jest.fn(() => null) }
        }
      }))
      const { buildApiObject } = await import('../feedback-job-process.js')
      const result = await buildApiObject(job.data.feedbackId)
      expect(result).toBeNull()
    })

    it('correctly creates a feedback payload', async () => {
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          feedbacks: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              feedbackData: { foo: 'bar' },
              sddsFeedbackId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { buildApiObject } = await import('../feedback-job-process.js')
      const payload = await buildApiObject(job.data.feedbackId)
      expect(payload).toEqual({
        feedback: {
          data: { foo: 'bar', feedbackId: 'b1847e67-07fa-4c51-af03-cb51f5126939' },
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
          feedbacks: { findByPk: jest.fn(() => { throw new Error() }) }
        }
      }))
      const { buildApiObject } = await import('../feedback-job-process.js')
      await expect(buildApiObject(0)).rejects.toThrow()
    })
  })

  describe('The feedbackJobProcess function - calls the update process and handles errors', () => {
    beforeAll(() => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        SEQUELIZE: { getSequelize: () => ({ fn: jest.fn() }) },
        POWERAPPS: { getClientUrl: jest.fn() }
      }))
    })

    it('Resolves when no error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        feedbackUpdate: jest.fn(() => [{
          apiTableName: 'feedbacks',
          keys: {
            apiKey: '656f6707-13e3-459d-8f1e-b1b30df79c09',
            sddsKey: 'f59e6275-adf7-ec11-82e6-002248c5c17e'
          }
        }]),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          feedbacks: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              feedbackData: { foo: 'bar' },
              sddsReturnId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { feedbackJobProcess } = await import('../feedback-job-process.js')
      await expect(() => feedbackJobProcess(job)).resolves
    })

    it('Resolves where no feedback found in database', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => ({
        feedbackUpdate: jest.fn(),
        BaseKeyMapping: BaseKeyMapping
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          feedbacks: { findByPk: jest.fn(() => null) }
        }
      }))
      const { feedbackJobProcess } = await import('../feedback-job-process.js')
      await expect(feedbackJobProcess(job)).resolves
    })

    it('Logs error and resolves with unrecoverable error', async () => {
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          feedbackUpdate: jest.fn(() => { throw new UnRecoverableBatchError() }),
          BaseKeyMapping: BaseKeyMapping
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          feedbacks: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              feedbackData: { foo: 'bar' },
              sddsFeedbackId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { feedbackJobProcess } = await import('../feedback-job-process.js')
      await expect(feedbackJobProcess(job)).resolves
    })

    it('Reject with recoverable error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => null)
      jest.doMock('@defra/wls-powerapps-lib', () => {
        return {
          UnRecoverableBatchError: UnRecoverableBatchError,
          feedbackUpdate: jest.fn(() => { throw new Error() }),
          BaseKeyMapping: BaseKeyMapping
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          feedbacks: {
            findByPk: jest.fn(() => ({
              id: 'b1847e67-07fa-4c51-af03-cb51f5126939',
              feedbackData: { foo: 'bar' },
              sddsFeedbackId: 'b1847e67-07fa-4c51-af03-cb51f5126939'
            }))
          }
        }
      }))
      const { feedbackJobProcess } = await import('../feedback-job-process.js')
      await expect(feedbackJobProcess(job)).rejects.toThrow()
    })
  })
})
