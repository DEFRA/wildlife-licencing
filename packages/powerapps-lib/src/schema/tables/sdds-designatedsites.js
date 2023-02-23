
import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsApplicationDesignatedSite = new Table('sdds_designatedsites', [
  new Column('sdds_permissionacquired', 'permissionFromOwner'),
  new Column('sdds_detailsofpermission', 'detailsOfPermission'),
  new Column('sdds_permissionfortheactivityfromne', 'adviceFromNaturalEngland'),
  new Column('sdds_neadvicefrom', 'adviceFromWho'),
  new Column('sdds_outcomeoftheadvisefromne', 'adviceDescription'),
  new Column('sdds_designatedsitenameid', 'onSiteOrCloseToSite')
], [
  new Relationship('sdds_designatedsites_sdds_applicationid_s', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  new Relationship('sdds_designatedsitename_sdds_designatedsi', 'sdds_designatedsitenames',
    RelationshipType.MANY_TO_ONE, 'sdds_designatedsitenameid',
    'activityId', null, null, OperationType.INBOUND_AND_OUTBOUND, true)
], 'applicationDesignatedSites', 'applicationDesignatedSites', 'sdds_designatedsitesid')
