# Current state of development

Development of this service is paused as of April 2024.

## Releases to environments

### `master` branch

The `master` branch is the branch that was most recently deployed to the `preprod` environment (ie. the live environment used for private beta).

### `develop` branch

The `develop` branch is in an interim state that is not yet ready to be deployed.

#### In-progress work

There are currently a few bits of work actively in progress:

* Implementing IDM as a method of signing in
* Updating the current dev build to the latest designs in the prototype, which is what's commonly been referred to as the "delta work" -- in maths, the difference between two values of a variable is its "delta", so here we're using delta to refer to the difference between the design of the dev build and the design of the prototype. This work covers two broad areas:
  * Changes to the contact details section
  * Changes to pages in other sections
* Changing page URLs, based on design work done to make them more user-readable
* Investigating and fixing a bug that stops some applications from being sent to the PowerApps backend (https://github.com/DEFRA/wildlife-licencing/issues/692)
* Investigating and fixing a bug that causes applications to be associated with multiple accounts (https://github.com/DEFRA/wildlife-licencing/issues/701)

##### In-progress work that must be done before deployment

Of these, the following are blockers that must be completed before the `develop` branch can be merged to `master` and subsequently deployed to `preprod`:

* Implementing IDM as a method of signing in
  * This is done, pending testing. The problem with this is that IDM was effectively done in isolation by one developer without any reference to tickets etc. This means that there are no tickets with acceptance criteria to test against.
* Investigating and fixing a bug that stops some applications from being sent to the PowerApps backend (https://github.com/DEFRA/wildlife-licencing/issues/692)
  * We were able to see the reason why the “send applications” job was failing; this was because various `sddsKey` elements (which represent an id generated on the PowerApps side) was null. Part of the code that processes applications was failing as it tries to turn the sddsKey into a string, and this errors if you try to do it on a null value. This could be fixed by simply amending this to not attempt to turn a null sddsKey intro a string; however, it could be that there's a more fundamental problem, which is that this value should never be null in the first place. Therefore, we initially planned to implement the simple fix, but continue to monitor it to see if this did actually fix it or if we needed to investigate the reason for it being null.
  * Note that a number of tickets ended up being blocked by this, as they required an application to be sent to the backend in order for testing to be completed.

##### In-progress work that should be done before deployment

The following bits of work are not technical blockers, and a deployment _could_ be done without them, but ideally they should be done before deployment:

* Updating the current dev build to use the latest contact details designs in the prototype
  * Parts of this work involve requesting additional information from users; this was considered by the business to be of a high priority as deploying without it means we're not capturing all the required info
  * Other parts involve content changes; this was also considered by the business to be of a high priority although it could potentially be deprioritised if needs be

##### In-progress work that doesn't need to be done before deployment

The remaining work is not strictly essential for deploying to preprod:

* Updating pages in other sections to match the prototype
  * These tickets were work that came out of reviewing designs (some of which was based on user research and testing). They were deemed to be lower priority because what we have does work, even if it's not reflecting feedback from our users. So, while they would need to be done to improve the service for users, they weren't actual blockers preventing us from proceeding.
* Changing page URLs to make them clearer
  * Again, this is work that would improve the service for users but aren't actual blockers.
* Investigating and fixing a bug that causes applications to be associated with multiple accounts (https://github.com/DEFRA/wildlife-licencing/issues/701)
  * This bug was identified although no investigation into the cause had been done yet. It's very much an edge case -- it only seems to occur when switching between multiple accounts -- so while it does need to be fixed, it does not need to be done before deployment. It may be _desirable_ to do it before deployment but it would be for the business to decide on the priority.

#### Work not currently in progress

There were some other bits of work that were due to be done but were not currently in flight. These should be captured elsewhere. One example would be increasing the timeout to stop users being logged out so quickly, which was something that came out of accessibility testing. This is something where the implementation relies on IDM (as we'd need to create a mechanism to refresh client-side tokens) and therefore had not yet been picked up as IDM had not yet been fully integrated.
