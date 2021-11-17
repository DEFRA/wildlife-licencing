import { init, createServer } from '../server.js'

describe('The server', () => {
  it('starts', done => {
    createServer().then(s => {
      init(s).then(() => {
        expect(s.info.port).toEqual(9000)
        s.events.on('stop', () => done())
        s.stop()
      })
    })
  })

  it('handles a request', done => {
    const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
    createServer().then(s => {
      init(s).then(() => {
        s.events.on('stop', () => done())
        s.inject({
          method: 'GET',
          url: `/user/${uuid}`
        }).then(r => {
          expect(r).toBe({ id: uuid })
          s.stop()
        }).catch(e => {
          console.log(e)
          s.stop()
        })
      })
    })
  })

  it.each([
    ['SIGINT', 130],
    ['SIGTERM', 137]
  ])('shuts down on %s', (signal, code, done) => {
    createServer().then(s => {
      init(s).then(() => {
        s.events.on('stop', () => done())
        const serverStopSpy = jest.spyOn(s, 'stop').mockImplementation(jest.fn())
        const processStopSpy = jest.spyOn(process, 'exit').mockImplementation(jest.fn())
        process.exit = processStopSpy
        process.emit(signal)
        setImmediate(async () => {
          expect(serverStopSpy).toHaveBeenCalled()
          expect(processStopSpy).toHaveBeenCalledWith(code)
          jest.restoreAllMocks()
          done()
        })
      })
    })
  })
})
