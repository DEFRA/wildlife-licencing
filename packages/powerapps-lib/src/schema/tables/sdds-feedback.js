import { Table, Column } from '../schema.js'

export const SddsFeedback = new Table('sdds_feedback', [
  new Column('sdds_rating', 'rating'),
  new Column('sdds_howcanweimprovethisservice', 'howCanWeImproveThisService')
], null, 'feedback', 'feedback', 'sdds_feedbackid')
