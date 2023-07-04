describe('the address service', () => {
  it('should wrap the address parts into a single line', async () => {
    const { addressLine } = await import('../address.js')
    const contact = {
      address: {
        subBuildingName: 'Jubilee House',
        buildingName: '',
        buildingNumber: '3',
        street: 'vicarage road',
        town: 'Aberdeen',
        county: 'merseyside',
        postcode: 'L6 3AU'
      }
    }
    expect(await addressLine(contact)).toStrictEqual('Jubilee House,<br>3,<br>vicarage road,<br>Aberdeen,<br>merseyside,<br>L6 3AU')
  })
})
