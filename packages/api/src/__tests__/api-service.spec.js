describe('The wrapper: api-service', () => {
  it('runs initialisation', (done) => {
    jest.isolateModules(() => {
      try {
        jest.mock('../server.js')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-queue-defs')

        const { createModels } = require('@defra/wls-database-model')
        const { createQueue } = require('@defra/wls-queue-defs')
        const { createServer, init } = require('../server.js')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        createServer.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest
          .fn()
          .mockImplementation(() => Promise.resolve())

        require('../api-service')
        setImmediate(() => {
          expect(init).toHaveBeenCalled()
          done()
        })
      } catch (e) {
        console.error(e)
        done(e)
      }
    })
  })

  it('has initialisation failure', (done) => {
    jest.isolateModules(() => {
      try {
        jest.mock('../server.js')
        jest.mock('@defra/wls-database-model')
        jest.mock('@defra/wls-connectors-lib')
        jest.mock('@defra/wls-queue-defs')

        const { createModels } = require('@defra/wls-database-model')
        const { createQueue } = require('@defra/wls-queue-defs')
        const { createServer, init } = require('../server.js')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')

        createQueue.mockImplementation(() => Promise.resolve())
        createModels.mockImplementation(() => Promise.resolve())
        createServer.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest
          .fn()
          .mockImplementation(() => Promise.resolve())
        init.mockImplementation(() => Promise.reject(new Error()))

        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation((code) => {})
        require('../api-service')
        setImmediate(() => {
          // expect(fetchSecrets).toHaveBeenCalled()
          expect(init).toHaveBeenCalled()
          expect(createServer).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        console.error(e)
        done(e)
      }
    })
  })
})
