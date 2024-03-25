import { timestampFormatterWithTime, timestampFormatter, yesNoFromBool } from '../common.js'

describe('common', () => {
  describe('timestampFormatterWithTime', () => {
    it('should return a human readable date and time, even inside daylight savings period', () => {
      // Set the system time to a time between daylight savings time to ensure its covered
      jest.setSystemTime(new Date('2022-06-01T15:00:00.000Z'))

      const humanReadableDateTime = timestampFormatterWithTime('2022-06-01T13:00:00.000Z')

      expect(humanReadableDateTime).toContain('1 June 2022, 1:00 pm')
    })

    it('should return a human readable date and time, even outside daylight savings period', () => {
      // Set the system time to a time between daylight savings time to ensure its covered
      jest.setSystemTime(new Date('2022-12-01T15:00:00.000Z'))

      const humanReadableDateTime = timestampFormatterWithTime('2022-12-01T13:00:00.000Z')

      expect(humanReadableDateTime).toContain('1 December 2022, 1:00 pm')
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
