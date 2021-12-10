import { createQueue, getQueue, queueDefinitions } from '../queue-defs.js'
import Queue from 'bull'

jest.mock('bull', () => jest.fn(() => ({})))

describe('the queue functions', () => {
  it('can create and get a queue', async () => {
    await createQueue(queueDefinitions.APPLICATION_QUEUE)
    expect(Queue).toHaveBeenCalledWith('application-queue', expect.any(Object))
    const appQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)
    expect(appQueue).toBeTruthy()
  })

  it('rejects with a failure', async () => {
    jest.mock('bull', () => jest.fn(() => { throw new Error() }))
    await expect(() => createQueue(queueDefinitions.APPLICATION_QUEUE)).rejects
  })
})
