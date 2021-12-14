import { createQueue, getQueue, queueDefinitions } from '../queue-defs.js'
import { activeHandler, completedHandler, stalledHandler, waitingHandler, errorHandler } from '../queue-funcs.js'

import Queue from 'bull'
const mockOn = jest.fn()

jest.mock('bull', () => jest.fn(() => {
  return { on: mockOn }
}))

describe('the queue functions', () => {
  it('can create and get a queue', async () => {
    await createQueue(queueDefinitions.APPLICATION_QUEUE)
    expect(Queue).toHaveBeenCalledWith('application-queue', expect.any(Object))
    const appQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
    expect(appQueue).toBeTruthy()
    expect(mockOn).toHaveBeenCalledTimes(5)
  })

  it('rejects with a failure', async () => {
    jest.mock('bull', () => jest.fn(() => { throw new Error() }))
    await expect(() => createQueue(queueDefinitions.APPLICATION_QUEUE)).rejects
  })

  it('event handlers do not throw', async () => {
    const job = {
      id: 1, data: { foo: 'bar' }
    }
    expect(() => activeHandler(job)).not.toThrow()
    expect(() => completedHandler(job)).not.toThrow()
    expect(() => stalledHandler(job)).not.toThrow()
    expect(() => waitingHandler(job)).not.toThrow()
    expect(() => errorHandler(job)).not.toThrow()
  })
})
