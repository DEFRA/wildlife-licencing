import {
  SddsApplication,
  SddsSite,
  Contact,
  Account, SddsApplicationType, SddsApplicationPurpose
} from '../../tables/tables.js'

import {
  srcObj,
  initialGeneratedAssignmentsObject,
  expectedApplicationRequestPath,
  applicationResponseObject,
  applicationResponseTransformedDataObject,
  applicationResponseTransformedKeys,
  applicationSiteResponseObject, applicationSiteResponseTransformedDataObject, applicationSiteResponseTransformedKeys
} from './example-src-object.js'

import { Relationship, RelationshipType, Table } from '../../schema.js'

jest.mock('../../../services/cache.js', () => ({
  getReferenceDataIdByName: jest.fn(() => '001')
}))

describe('the schema processes', () => {
  beforeEach(() => jest.resetModules())

  describe('the createTableSet function', () => {
    it('can determine the correct batch update sequence with a set of tables', async () => {
      const { createTableSet } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite, Contact, Account])

      expect(tableSet.map(t => t.name))
        .toEqual(['sdds_sites', 'contacts', 'accounts', 'contacts', 'accounts', 'sdds_applications'])

      expect(tableSet.map(t => t.basePath))
        .toEqual(['application.sites', 'application.applicant', 'application.applicantOrganization',
          'application.ecologist', 'application.ecologistOrganization', 'application'])
    })
  })

  describe('the createTableColumnsPayload function', () => {
    it('can create the batch update columns object for a simple table; the contact table', async () => {
      const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [Contact, Account])
      const applicant = tableSet.find(ts => ts.basePath === 'application.applicant')
      const { columnPayload } = await createTableColumnsPayload(applicant, srcObj, tableSet)
      expect(columnPayload).toEqual({
        address1_city: 'briztol',
        address1_county: 'bristol',
        address1_line1: 'the grove',
        address1_line2: 'henleaze',
        address1_postalcode: 'BS1999',
        emailaddress1: 'me@email.com',
        lastname: 'Bob Slaigh',
        telephone1: '16542',
        sdds_sourceremote: true
      })
    })

    it('can create the batch update columns object for complex table; the applications table', async () => {
      const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsSite])
      const applicationPayload = await createTableColumnsPayload(SddsApplication, srcObj, tableSet)
      expect(applicationPayload).toEqual({
        columnPayload: {
          sdds_applicationcategory: 100000001,
          sdds_applicationnumber: '2022-500000-EPS-MIT',
          sdds_descriptionofproposal: 'Badgers are proposed to be moved',
          sdds_detailsofconvictions: 'no convictions',
          sdds_sourceremote: true,
          sdds_whydoyouneedalicence: 'need to move some badgers'
        },
        id: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
        relationshipsPayload: {
          'sdds_applicantid@odata.bind': 'sdds_application_applicantid_Contact',
          'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurposes(001)',
          'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypeses(001)',
          'sdds_ecologistid@odata.bind': 'sdds_application_ecologistid_Contact',
          'sdds_ecologistorganisationid@odata.bind': 'sdds_application_ecologistorganisationid_',
          'sdds_organisationid@odata.bind': 'sdds_application_organisationid_Account'
        }
      })
    })

    it('can create the batch update columns for sites; an array of items', async () => {
      const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite])
      const site = tableSet.find(ts => ts.name === 'sdds_sites')
      const sitesPayloads = await createTableColumnsPayload(site, srcObj)
      expect(sitesPayloads).toEqual([
        {
          id: '842fc15b-2858-4349-86ea-b33a0629a30b',
          columnPayload: {
            sdds_name: 'The badger set 1',
            sdds_osgridreference: '7868962',
            sdds_addressline1: 'Winscombe',
            sdds_county: 'Somerset',
            sdds_postcode: 'BS21 2XX',
            sdds_sourceremote: true
          },
          relationshipsPayload: {}
        },
        {
          id: '15385397-6df3-45f8-9c98-4551815bbfa0',
          columnPayload: {
            sdds_name: 'The badger set 2',
            sdds_osgridreference: '7868962',
            sdds_addressline1: 'Winscombe',
            sdds_addressline2: null, // Explicit set null
            sdds_county: 'Somerset',
            sdds_postcode: 'BS22 2XX',
            sdds_sourceremote: true
          },
          relationshipsPayload: {}
        },
        {
          id: '27e20450-f414-445e-995b-8d7caf53ab2c',
          columnPayload: {
            sdds_name: 'The badger set 3',
            sdds_osgridreference: '786896',
            sdds_addressline1: 'Winscombe',
            sdds_county: 'Somerset',
            sdds_postcode: 'BS23 2XX',
            sdds_sourceremote: true
          },
          relationshipsPayload: {}
        }
      ])
    })

    it('omits the payload if the base path is not set', async () => {
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload({ basePath: 'not-correct' }, srcObj)
      expect(result).toBeNull()
    })

    it('executes a table relationship with a parameterless srcFunc', async () => {
      const mockFunction = jest.fn(() => 'foo')
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', null, mockFunction)], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: 'data' }, [])
      expect(mockFunction).toHaveBeenCalled()
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {
          'testid@odata.bind': '/child(foo)'
        }
      })
    })

    it('executes a table relationship with a parameterless srcFunc; returning null, is ignored', async () => {
      const mockFunction = jest.fn(() => null)
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', null, mockFunction)], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: 'data' }, [])
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {}
      })
    })

    it('returns nothing with a relationship with no value', async () => {
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', 'rel')], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: { } }, [])
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {}
      })
    })

    it('returns nothing with a relationship with no value where a function is provided', async () => {
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', 'rel', () => 'a')], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: { } }, [])
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {}
      })
    })
  })

  describe('the createTableRelationshipsPayloads function', () => {
    it('creates a correct many-to-many post statement object', async () => {
      const { createTableRelationshipsPayloads } = await import('../schema-processes.js')
      const updateObjects = {
        table: 'sdds_licensableactions',
        relationshipName: 'sdds_licensableaction_applicationid_sdds_',
        contentId: 1,
        assignments: {
          sdds_species: 'This place'
        },
        powerAppsId: 'ad748889-0390-ec11-b400-000d3a8728b2',
        method: 'PATCH'
      }
      const result = await createTableRelationshipsPayloads(SddsApplication, [updateObjects])
      expect(result).toEqual([{ assignments: { '@odata.id': '$1' }, name: 'sdds_licensableaction_applicationid_sdds_' }])
    })
  })

  describe('the createBatchRequestObjects function', () => {
    it('can produce a set of insert and objects from a table set and source data', async () => {
      const { createTableSet, createBatchRequestObjects } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite, Contact, Account])
      const results = await createBatchRequestObjects(srcObj, tableSet)
      expect(results).toEqual(initialGeneratedAssignmentsObject)
    })
  })

  describe('the buildRequestPath function', () => {
    it('generates the correct request path for the main application extract', async () => {
      const { buildRequestPath } = await import('../schema-processes.js')
      const applicationRequestPath = buildRequestPath(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])
      expect(applicationRequestPath).toBe(expectedApplicationRequestPath)
    })
  })

  describe('the buildObjectTransformer function', () => {
    it('build function to process an application response element', async () => {
      const { buildObjectTransformer, createTableSet } = await import('../schema-processes.js')
      const applicationTableSet = createTableSet(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])
      const applicationObjectTransformer = buildObjectTransformer(SddsApplication, applicationTableSet)
      expect(applicationObjectTransformer).toEqual(expect.any(Function))
      await expect(applicationObjectTransformer(applicationResponseObject)).resolves.toEqual({
        data: applicationResponseTransformedDataObject,
        keys: applicationResponseTransformedKeys
      })
    })

    it.only('build function to process an application-site response element', async () => {
      const { buildObjectTransformer, createTableSet } = await import('../schema-processes.js')
      const applicationSiteTableSet = createTableSet(SddsApplication, [SddsSite])
      const applicationSiteObjectTransformer = buildObjectTransformer(SddsApplication, applicationSiteTableSet)
      expect(applicationSiteObjectTransformer).toEqual(expect.any(Function))
      await expect(applicationSiteObjectTransformer(applicationSiteResponseObject)).resolves.toEqual({
        data: expect.any(Object),
        keys: [
          {
            apiBasePath: 'application',
            apiKey: null,
            apiTable: 'applications',
            contentId: null,
            powerAppsKey: '2b6759f9-268f-ec11-b400-000d3a8728b2',
            powerAppsTable: 'sdds_applications'
          },
          {
            apiBasePath: 'application.sites',
            apiKey: null,
            apiTable: 'sites',
            contentId: null,
            powerAppsKey: '286759f9-268f-ec11-b400-000d3a8728b2',
            powerAppsTable: 'sdds_sites'
          },
          {
            apiBasePath: 'application.sites',
            apiKey: null,
            apiTable: 'sites',
            contentId: null,
            powerAppsKey: 'd0d79386-fd8f-ec11-b400-000d3a872ae7',
            powerAppsTable: 'sdds_sites'
          }

        ]
      })
    })
  })
})
