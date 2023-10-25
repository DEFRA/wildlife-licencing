import { yesNoNASrc, yesNoNATgt, dateConvSrc, dateConvTgt, yesNoNATgtNeg, yesNoNASrcNeg } from '../common.js'

describe('common table functions', () => {
  it('yes-no functions work as expected', () => {
    expect(yesNoNATgt(100000000)).toBeTruthy()
    expect(yesNoNATgt(100000001)).not.toBeTruthy()
    expect(yesNoNASrc(true)).toBe(100000000)
    expect(yesNoNASrc(false)).toBe(100000001)

    expect(yesNoNATgtNeg(100000001)).toBeTruthy()
    expect(yesNoNATgtNeg(100000000)).not.toBeTruthy()
    expect(yesNoNASrcNeg(true)).toBe(100000001)
    expect(yesNoNASrcNeg(false)).toBe(100000000)
  })

  it('date functions work as expected', () => {
    expect(dateConvSrc('2023-07-25T00:00:00.000Z')).toEqual('2023-07-25')
    expect(dateConvTgt('2023-07-25')).toBe('2023-07-25T00:00:00.000Z')
  })
})
