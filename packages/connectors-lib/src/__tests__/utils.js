import { endProcess } from '../utils.js'

describe('Test utilities', () => {
  test('End process', () => {
    const processStopSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn())
    endProcess('error')
    expect(processStopSpy).toHaveBeenCalled()
  })
})
