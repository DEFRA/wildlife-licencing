// These states are common goverment pattern states, and are mirrored in /applications-text.njk
// If you want to read more about the states that should appear on a tasklist page
// Gov.uk docs are here: https://design-system.service.gov.uk/patterns/task-list-pages/
export const tagStatus = {
  // if the user cannot start the task yet
  // for example because another task must be completed first
  CANNOT_START: 'cannot-start',

  // if the user can start work on the task, but has not done so yet
  NOT_STARTED: 'not-started',

  // if the user has started but not completed the task
  IN_PROGRESS: 'in-progress',

  // if the user has gone through the flow once
  // but not clicked "no" on the yes, no radio buttons
  // to confirm they don't want to enter any more information
  // we now can still take them back to the check-your-answers page
  // and so that the tasklist "tag" still shows "In Progress" - https://design-system.service.gov.uk/patterns/task-list-pages/task-list-statuses.png
  COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed',

  // this state may seem unintuitive, but there are some flows that you can start from the very beginning again
  // & we need a way to tell the difference cleanly between:
  //    1. your journey is `complete-not-confirmed` and youre only editing a single answer from the cya page
  //    2. you are starting the flow again, and WONT go back to cya after you answer a question
  //    3. having a state that will take the users back to the cya page, if they leave mid journey and try to use the flow again
  ONE_COMPLETE_AND_REST_IN_PROGRESS: 'one-complete-and-rest-in-progress',

  // if the user has completed the task
  COMPLETE: 'complete'
}

Object.freeze(tagStatus)
