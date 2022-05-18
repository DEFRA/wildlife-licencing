// This one is an example and covers off all the section handlers

import { keyFunc, removeKeyFunc, sddsGetKeyFunc, removeSddsKeyFunc } from '../../application-section/section-keys-func.js'
const apiBasePath = 'applicant'
const sddsKey = 'sddsContactId'

const targetKeys = [
  {
    apiKey: '24a365c5-1b83-4d07-880d-1d7056b14c00',
    apiTable: 'applications',
    apiBasePath: 'application',
    powerAppsKey: 'cbf70b15-15d5-ec11-a7b5-0022481a8a39',
    powerAppsTable: 'sdds_applications'
  },
  {
    apiKey: null,
    apiTable: 'applications',
    apiBasePath: 'application.applicant',
    powerAppsKey: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39',
    powerAppsTable: 'contacts'
  }
]

describe('applicant-handlers', () => {
  describe('keyFunc', () => {
    it('returns the power apps key from targetKeys', async () => {
      const res = keyFunc(apiBasePath, sddsKey)(targetKeys)
      expect(res).toEqual({ sddsContactId: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39' })
    })
    it('returns null if power apps key not found', async () => {
      const res = keyFunc(apiBasePath, sddsKey)([])
      expect(res).toBeNull()
    })
    it('returns null target keys is null', async () => {
      const res = keyFunc(apiBasePath, sddsKey)(null)
      expect(res).toBeNull()
    })
  })
  describe('removeKeyFunc', () => {
    it('returns the power apps key from targetKeys', async () => {
      const res = removeKeyFunc(apiBasePath)(targetKeys)
      expect(res).toEqual([targetKeys[0]])
    })
    it('returns unchanged if power apps key not found', async () => {
      const res = removeKeyFunc(apiBasePath)([{ foo: 'bar' }])
      expect(res).toEqual([{ foo: 'bar' }])
    })
    it('returns null target keys is null', async () => {
      const res = removeKeyFunc(apiBasePath)(null)
      expect(res).toBeNull()
    })
  })
  describe('sddsGetKeyFunc', () => {
    it('returns the key from the payload', async () => {
      const res = sddsGetKeyFunc(sddsKey)({ payload: { sddsContactId: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39' } })
      expect(res).toEqual('c9f70b15-15d5-ec11-a7b5-0022481a8a39')
    })
    it('returns null if power apps key not found', async () => {
      const res = sddsGetKeyFunc(sddsKey)({ payload: {} })
      expect(res).toBeNull()
    })
  })
  describe('removeSddsKeyFunc', () => {
    it('removes the key from the payload', async () => {
      const req = { payload: { sddsContactId: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39' } }
      removeSddsKeyFunc(sddsKey)(req)
      expect(req).toEqual({ payload: { } })
    })
  })
})
