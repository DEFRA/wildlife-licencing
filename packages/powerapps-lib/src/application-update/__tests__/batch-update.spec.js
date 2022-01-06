import { batchUpdate } from '../batch-update.js'

export const payload = {
  applicant: {
    lastname: 'Botham',
    firstname: 'Ian',
    email: 'Ian.botham@gmail.com',
    phone: '876877666876',
    address:
      {
        postcode: 'BS92LT',
        addrline1: '1 The cottages',
        addrline2: 'The Village',
        addrline3: 'Taunton',
        county: 'Somerset'
      }
  },
  ecologist: {
    firstname: 'Brian',
    lastname: 'The-Ecologist',
    email: 'brian.ecologist@gmail.com',
    phone: '+44 837248649864',
    address:
      {
        postcode: 'YT56 9UW',
        addrline1: 'The University',
        addrline2: 'University Rd.',
        addrline3: 'Cambridge',
        county: 'Cambridgeshire'
      }
  },
  proposalDescription: 'move some newts across a road',
  detailsOfConvictions: 'speeding fine 2008. 167mph.'
}

describe('The batch query update', () => {
  it('makes the correct low level fetch call', async () => {
    const response = await batchUpdate(payload)
    console.log(JSON.stringify(response))
  })
})
