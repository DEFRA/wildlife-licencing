import { applicationModel } from '../model/sdds-application-model.js'

describe('Application read stream', () => {
  it('correctly calls read stream', async () => {
    const mockReadStream = jest.fn()
    jest.doMock('../../extract/powerapps-read-stream.js', () => ({
      extractAndTransform: mockReadStream
    }))
    const { applicationReadStream } = await import('../application-read-stream.js')
    applicationReadStream()
    expect(mockReadStream).toHaveBeenCalledWith(applicationModel)
  })
})
