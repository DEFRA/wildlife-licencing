import { timestampFormatterWithTime, timestampFormatter, yesNoFromBool } from '../common.js'

describe('common', () => {
  describe('timestampFormatterWithTime', () => {
    it('should return a human readable date and time', () => {
      const humanReadableDateTime = timestampFormatterWithTime('2021-01-01T12:00:00.000Z')

      expect(humanReadableDateTime).toEqual('1 January 2021 at 12:00')
    })
  })

  describe('timestampFormatter', () => {
    it('should return a human readable date and time', () => {
      const humanReadableDate = timestampFormatter('2021-01-01T12:00:00.000Z')

      expect(humanReadableDate).toEqual('1 January 2021')
    })
  })

  // test for yesNoFromBool
  describe('yesNoFromBool', () => {
    it('should return yes if true', () => {
      const yesNo = yesNoFromBool(true)

      expect(yesNo).toEqual('yes')
    })

    it('should return no if false', () => {
      const yesNo = yesNoFromBool(false)

      expect(yesNo).toEqual('no')
    })

    it('should return - if undefined', () => {
      const yesNo = yesNoFromBool(undefined)

      expect(yesNo).toEqual('-')
    })
  })
})
