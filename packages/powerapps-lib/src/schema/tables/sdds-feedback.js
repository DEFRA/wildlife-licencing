import { Table, Column } from '../schema.js'

export const SddsFeedback = new Table('sdds_feedbacks', [
  new Column('sdds_rating', 'sddsRating'),
  new Column('sdds_howcanweimprovethisservice', 'howCanWeImproveThisService')
], null, 'feedback', 'feedbacks', 'sdds_feedbackid')
