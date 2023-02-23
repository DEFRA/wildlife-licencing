import { Table, Column } from '../schema.js'

export const SddsDesignatedSites = new Table('sdds_designatedsitenames', [
  new Column('sdds_sitename', 'siteName'),
  new Column('sdds_sitecodeno', 'siteCode'),
  new Column('sdds_gridreference', 'siteGridReference'),
  new Column('sdds_type', 'siteType')
], [], null, 'designated-sites', 'sdds_designatedsitenameid')
