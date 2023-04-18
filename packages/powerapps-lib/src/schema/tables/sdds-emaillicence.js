import { OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsEmailLicence = new Table('sdds_emaillicences', [
], [
  new Relationship('sdds_emaillicence_sdds_applicationid_sdds', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid', 'sddsApplicationId',
    null, null, OperationType.OUTBOUND),

  new Relationship('sdds_sdds_emaillicence_contactid_contact', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_contactid', 'sddsContactId',
    null, null, OperationType.OUTBOUND),

  new Relationship('sdds_sdds_emaillicence_organisationid_account', 'accounts',
    RelationshipType.MANY_TO_ONE, 'sdds_organisationid', 'sddsAccountId',
    null, null, OperationType.OUTBOUND)
], 'emailLicence')
