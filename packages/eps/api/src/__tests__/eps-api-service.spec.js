describe('The wrapper: eps-api-service', () => {
  it('runs initialisation', done => {
    jest.isolateModules(() => {
      try {
        jest.mock('../server.js')
        jest.mock('../model/sequentelize-model.js')
        jest.mock('@defra/wls-connectors-lib')
        const { createServer, init } = require('../server.js')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        createServer.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        require('../eps-api-service')
        setImmediate(() => {
          expect(init).toHaveBeenCalled()
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
        jest.mock('../server.js')
        jest.mock('../model/sequentelize-model.js')
        jest.mock('@defra/wls-connectors-lib')
        const { createServer, init } = require('../server.js')
        const { SEQUELIZE } = require('@defra/wls-connectors-lib')
        createServer.mockImplementation(() => Promise.resolve())
        SEQUELIZE.initialiseConnection = jest.fn().mockImplementation(() => Promise.resolve())
        init.mockImplementation(() => Promise.reject(new Error()))
        const processExitSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(code => {})
        require('../eps-api-service')
        setImmediate(() => {
          // expect(fetchSecrets).toHaveBeenCalled()
          expect(init).toHaveBeenCalled()
          expect(createServer).toHaveBeenCalled()
          expect(processExitSpy).toHaveBeenCalledWith(1)
          done()
        })
      } catch (e) {
        done(e)
      }
    })
  })
})
