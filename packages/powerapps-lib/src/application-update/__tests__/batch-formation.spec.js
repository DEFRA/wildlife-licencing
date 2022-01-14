/* eslint-disable camelcase */
import { openBatchRequest, createBatchRequestBody, createKeyObject } from '../batch-formation.js'
import { model } from '../../model/sdds-model.js'
import fs from 'fs'
import path from 'path'
import { findRequestSequence } from '../../model/model-utils.js'
import src from '../../model/test-data/json-src.js'

/**
 * Content-Type:multipart/mixed;boundary=batch_499D1B
 Accept:application/json
 OData-MaxVersion: 4.0
 OData-Version: 4.0
 Prefer:return=representation
 */
describe('Batch query formation', () => {
  it('forms a batch query set for a basic data subset', async () => {
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })
    const batchId = openBatchRequest()

    const clientUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'
    const batchQuery = createBatchRequestBody(batchId, sequence, src, {}, clientUrl)

    expect(batchQuery).toContain(`--batch_${batchId}`)
    expect(batchQuery).toContain(`POST ${clientUrl}/contacts HTTP/1.1`)
    expect(batchQuery).toContain(`POST ${clientUrl}/sdds_applications HTTP/1.1`)
    expect(batchQuery).toContain(JSON.stringify({
      firstname: 'Ian',
      lastname: 'Botham',
      address1_line1: '1 The cottages',
      address1_line2: 'The Village',
      address1_line3: 'Taunton',
      address1_county: 'Somerset',
      address1_postalcode: 'BS92LT',
      address1_telephone1: '876877666876',
      emailaddress1: 'Ian.botham@gmail.com'
    }, null, 4))

    expect(batchQuery).toContain(JSON.stringify({
      firstname: 'Brian',
      lastname: 'The-Ecologist',
      address1_line1: 'The University',
      address1_line2: 'University Rd.',
      address1_line3: 'Cambridge',
      address1_county: 'Cambridgeshire',
      address1_postalcode: 'YT56 9UW',
      address1_telephone1: '+44 837248649864',
      emailaddress1: 'brian.ecologist@gmail.com'
    }, null, 4))

    expect(batchQuery).toContain(JSON.stringify({
      sdds_descriptionofproposal: 'move some newts across a road',
      sdds_detailsofconvictions: 'speeding fine 2008. 167mph.',
      sdds_sourceremote: true,
      'sdds_applicantid@odata.bind': '$1',
      'sdds_ecologistid@odata.bind': '$2'
    }, null, 4))
  })

  it('is able to parse the success response', async () => {
    const batchId = openBatchRequest()
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })

    const baseUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'

    const { POWERAPPS } = await import('@defra/wls-connectors-lib')
    POWERAPPS.batchRequest = jest.fn(async () => Promise.resolve(
      fs.readFileSync(path.join(__dirname, '/success-response.txt'), { encoding: 'utf8' })))

    const response = await POWERAPPS.batchRequest(batchId, '')
    expect(response).toContain('--batchresponse_546e00b0-78e1-4917-a359-c3aa31c64c76')
    const keyObject = createKeyObject(response, sequence, baseUrl)

    expect(keyObject).toEqual({
      applicant: {
        eid: '7d17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'contacts'
      },
      ecologist: {
        eid: '7f17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'contacts'
      },
      sdds_applications: {
        eid: '8417ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'sdds_applications'
      }
    })
  })

  it('forms a batch query set for an application update', async () => {
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })
    const batchId = openBatchRequest()

    const clientUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'
    const batchQuery = createBatchRequestBody(batchId, sequence, src, {
      applicant: {
        eid: '9d17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'contacts'
      },
      ecologist: {
        eid: '9f17ae34-3c62-ec11-8f8f-0022480078bf',
        entity: 'contacts'
      },
      sdds_applications: {
        eid: '9417ae34-3c62-ec11-8f8f-0022480078df',
        entity: 'sdds_applications'
      }
    }, clientUrl)

    expect(batchQuery).toContain(`PATCH ${clientUrl}/contacts(9d17ae34-3c62-ec11-8f8f-0022480078af)`)
    expect(batchQuery).toContain(`PATCH ${clientUrl}/contacts(9f17ae34-3c62-ec11-8f8f-0022480078bf)`)
    expect(batchQuery).toContain(`PATCH ${clientUrl}/sdds_applications(9417ae34-3c62-ec11-8f8f-0022480078df)`)
  })

  it('forms a batch query set for a partial application update', async () => {
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })
    const batchId = openBatchRequest()

    const clientUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'
    const batchQuery = createBatchRequestBody(batchId, sequence, src, {
      applicant: {
        eid: '9d17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'contacts'
      },
      sdds_applications: {
        eid: '9417ae34-3c62-ec11-8f8f-0022480078df',
        entity: 'sdds_applications'
      }
    }, clientUrl)

    expect(batchQuery).toContain(`PATCH ${clientUrl}/contacts(9d17ae34-3c62-ec11-8f8f-0022480078af)`)
    expect(batchQuery).toContain(`POST ${clientUrl}/contacts HTTP/1.1`)
    expect(batchQuery).toContain(`PATCH ${clientUrl}/sdds_applications(9417ae34-3c62-ec11-8f8f-0022480078df)`)
  })
})
