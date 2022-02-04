import { createServer, init } from '../server'

describe('The WEB server', () => {
  it('starts', done => {
    createServer().then(s => {
      init(s).then(() => {
        expect(s.info.port).toEqual(4000)
        s.events.on('stop', () => done())
        s.stop()
      })
    })
  })

  it('handles a request', done => {
    createServer().then(s => {
      init(s).then(() => {
        s.events.on('stop', () => done())
        s.inject({
          method: 'GET',
          url: '/hello'
        })
          .then(r => {
            expect(r).toBe('Hello World!')
            s.stop()
          })
          .catch(e => {
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
        const serverStopSpy = jest
          .spyOn(s, 'stop')
          .mockImplementation(jest.fn())
        const processStopSpy = jest
          .spyOn(process, 'exit')
          .mockImplementation(jest.fn())
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
