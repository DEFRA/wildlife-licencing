import { createBatchRequestBody, openBatchRequest } from '../batch-formation.js'
import { sddsSites } from '../../application/model/sdds-sites.js'
import { sddsApplications } from '../../application/model/sdds-applications.js'

const srcJson = {
  sites: [
    {
      name: 'The badger set',
      address: { county: 'Somerset', postcode: 'bs25 2ZZ', addrline1: 'Winscombe', houseNumber: 'The fields' },
      gridReference: '3456'
    },
    {
      name: 'The badger set2',
      address: { county: 'Somerset', postcode: 'bs27 2ZZ', addrline1: 'Winscombe', houseNumber: 'The fields' },
      gridReference: '3456534'
    },
    {
      name: 'The badger set22',
      address: { county: 'Somerset', postcode: 'bs26 2ZZ', addrline1: 'Winscombe', houseNumber: 'The fields' },
      gridReference: '7eryer868962'
    },
    {
      name: 'The badger set3',
      address: { county: 'Somerset', postcode: 'bs24 2ZZ', addrline1: 'Winscombe', houseNumber: 'The fields' },
      gridReference: '456'
    }
  ]
}

const appSrc = { applicant: { lastname: 'baker', firstname: 'andrew' } }

const model = { sdds_sites: sddsSites }

describe('The batch query update', () => {
  beforeEach(() => jest.resetModules())

  it('makes the correct lower level call to the connectors library', async () => {
    const batchId = openBatchRequest(model)
    // const batchId = openBatchRequest({ sdds_applications: sddsApplications })
    const batchRequestBody = await createBatchRequestBody(batchId, srcJson, { }, 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0')
    console.log(batchRequestBody)
  })
})
