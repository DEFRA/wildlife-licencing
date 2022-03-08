
describe('The queue connector', () => {
  beforeEach(() => jest.resetModules())
  it('uses the redis parameters', async () => {
    jest.doMock('../config.js', () => ({
      queue: {},
      redis: {
        host: 'redis-host',
        port: 'redis-port',
        database: 'redis-database'
      }
    }))
    const { QUEUE } = await import('../queue.js')
    const c = QUEUE.connection
    expect(c).toEqual({
      database: 'redis-database',
      host: 'redis-host',
      port: 'redis-port'
    })
  })
})
