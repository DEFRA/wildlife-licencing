import { yesNoNASrc, yesNoNATgt } from '../common.js'

describe('common table functions', () => {
  it('yes-no functions work as expected', () => {
    expect(yesNoNATgt(100000000)).toBeTruthy()
    expect(yesNoNATgt(100000001)).not.toBeTruthy()
    expect(yesNoNASrc(true)).toBe(100000000)
    expect(yesNoNASrc(false)).toBe(100000001)
  })
})
