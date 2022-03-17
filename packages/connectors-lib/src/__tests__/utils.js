import { endProcess, hide } from '../utils.js'

describe('Test utilities', () => {
  test('End process', () => {
    const processStopSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn())
    endProcess('error')
    expect(processStopSpy).toHaveBeenCalled()
  })

  test('hide password obscures password', () => {
    expect(hide({ password: 'abcde' }, 'password')).toEqual({ password: 'ab**de' })
    expect(hide({ password: 'abcdefghijk' }, 'password')).toEqual({ password: 'ab**jk' })
  })

  test('hide password returns object if supplied a not valid path', () => {
    expect(hide({ password: 'abcdefg' }, 'not-exists')).toEqual({ password: 'abcdefg' })
  })

  test('hide password returns object if password is shorter then 5 characters', () => {
    expect(hide({ password: 'abcd' }, 'password')).toEqual({ password: 'abcd' })
  })
})
