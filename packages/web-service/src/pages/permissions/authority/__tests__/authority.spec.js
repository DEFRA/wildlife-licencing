describe('The permissions authority page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        OTHER: {
          authorities: () => [
            { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 1' },
            { id: '7829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 3' },
            { id: '8829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 2' }
          ]
        }
      }
    }))
    const { getData } = await import('../authority.js')
    const result = await getData()
    expect(result).toEqual({
      authorities: [
        {
          id: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 1'
        },
        {
          id: '7829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 3'
        },
        {
          id: '8829ad54-bab7-4a78-8ca9-dcf722117a45',
          name: 'Auth 2'
        }
      ],
      selected: {
        id: '1f64da5a-4276-ed11-81ad-0022481b5bf5'
      }
    })
  })

  it('validator', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        OTHER: {
          authorities: () => [
            { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 1' },
            { id: '7829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 3' },
            { id: '8829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 2' }
          ]
        }
      }
    }))
    const { validator } = await import('../authority.js')
    await expect(() => validator({ payload: { authorityId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' } })).resolves
    await expect(() => validator({ payload: { fbAuthorityId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' } })).resolves
    await expect(() => validator({ payload: { authorityId: '' } })).rejects.toThrow()
    await expect(() => validator({ payload: { fbAuthorityId: '' } })).rejects.toThrow()
  })

  it('setData', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        OTHER: {
          authorities: () => [
            { id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 1' },
            { id: '7829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 3' },
            { id: '8829ad54-bab7-4a78-8ca9-dcf722117a45', name: 'Auth 2' }
          ]
        }
      }
    }))
    const { setData } = await import('../authority.js')
    const spy = jest.spyOn(console, 'log').mockImplementation(() => null)
    await setData({ payload: { authorityId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' } })
    await setData({ payload: { fbAuthorityId: '6829ad54-bab7-4a78-8ca9-dcf722117a45' } })
    expect(spy).toHaveBeenCalledWith('Auth 1')
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
