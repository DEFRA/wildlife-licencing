import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'
import { yesNoNASrc, yesNoNATgt } from './common.js'

export const SddsApplicationDesignatedSite = new Table('sdds_designatedsiteses', [
  new Column('sdds_permissionacquired', 'permissionFromOwner'),
  new Column('sdds_detailsofpermission', 'detailsOfPermission'),
  new Column('sdds_permissionfortheactivityfromne', 'adviceFromNaturalEngland',
    s => yesNoNASrc(s), t => yesNoNATgt(t)),
  new Column('sdds_neadvicefrom', 'adviceFromWho'),
  new Column('sdds_outcomeoftheadvisefromne', 'adviceDescription'),
  new Column('sdds_onnexttonear', 'onSiteOrCloseToSite')
], [
  new Relationship('sdds_designatedsites_sdds_applicationid_s', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid_sdds_application',
    'applicationId', null, null, OperationType.INBOUND, true),

  new Relationship('sdds_designatedsitename_sdds_designatedsi', 'sdds_designatedsitenames',
    RelationshipType.MANY_TO_ONE, 'sdds_designatedsitenameid',
    'designatedSiteId', null, null, OperationType.INBOUND_AND_OUTBOUND, true)
], 'applicationDesignatedSites', 'applicationDesignatedSites', 'sdds_designatedsitesid')
