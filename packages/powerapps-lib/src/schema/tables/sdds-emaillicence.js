import { v4 as uuidv4 } from 'uuid'
import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsEmailLicence = new Table('sdds_emaillicences', [
  new Column('sdds_name', null, () => uuidv4())
], [
  new Relationship('sdds_emaillicence_sdds_applicationid_sdds', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid', 'sddsApplicationId',
    null, null, OperationType.OUTBOUND)
], 'emailLicence')
