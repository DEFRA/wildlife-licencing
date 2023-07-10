jest.spyOn(console, 'error').mockImplementation(() => null)

describe('The wrapper: file-queue-processor', () => {
  afterAll(done => {
    jest.clearAllMocks()
    done()
  })

  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib', () => ({
          AWS: { S3: () => ({}) },
          SEQUELIZE: { DataTypes: 'foo', QueryTypes: 'foo' },
          GRAPH: { client: jest.fn(() => ({ init: jest.fn() })) }
        }))

        jest.mock('@defra/wls-queue-defs')

        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        const { createModels } = require('@defra/wls-database-model')
        const { createQueue, queueWorker } = require('@defra/wls-queue-defs')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())

        queueWorker.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())

        require('../file-queue-processor')
        setImmediate(() => {
          expect(queueWorker).toHaveBeenCalled()
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })

  it('has initialisation failure', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-queue-defs')
        jest.mock('@defra/wls-connectors-lib', () => ({
          AWS: { S3: () => ({}) },
          SEQUELIZE: { DataTypes: 'foo', QueryTypes: 'foo' },
          REDIS: { initialiseConnection: jest.fn() },
          GRAPH: { client: jest.fn(() => ({ init: jest.fn() })) }
        }))

        const { createModels } = require('@defra/wls-database-model')
        const { createQueue, queueWorker } = require('@defra/wls-queue-defs')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        queueWorker.mockImplementation(() => Promise.reject(new Error()))

        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(code => {})
        require('../file-queue-processor')
        setImmediate(() => {
          expect(queueWorker).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
