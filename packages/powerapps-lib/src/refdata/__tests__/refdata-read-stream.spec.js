import { applicationTypesModel } from '../model/sdds-application-types.js'
import { applicationPurposesModel } from '../model/sdds-application-purposes.js'

describe('Reference data read stream', () => {
  beforeEach(() => jest.resetModules())
  it('correctly calls application types read stream', async () => {
    const mockReadStream = jest.fn()
    jest.doMock('../../extract/powerapps-read-stream.js', () => ({
      extractAndTransform: mockReadStream
    }))
    const { applicationTypesReadStream } = await import('../refdata-read-stream.js')
    applicationTypesReadStream()
    expect(mockReadStream).toHaveBeenCalledWith(applicationTypesModel)
  })

  it('correctly calls application purposes read stream', async () => {
    const mockReadStream = jest.fn()
    jest.doMock('../../extract/powerapps-read-stream.js', () => ({
      extractAndTransform: mockReadStream
    }))
    const { applicationPurposesReadStream } = await import('../refdata-read-stream.js')
    applicationPurposesReadStream()
    expect(mockReadStream).toHaveBeenCalledWith(applicationPurposesModel)
  })
})
