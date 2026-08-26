# Community Website Validation

The new public AWS Community at S.B. Jain website was opened successfully in the browser. Its public navigation, programme overview, sessions feed, noticeboard, institutional link, and enquiry action were visible. The mobile viewport also retained the full information hierarchy and did not show horizontal overflow.

Authenticated event registration and Student Builder Program submission are protected by the existing student sign-in flow. The public interface presents the sign-in state before a user can submit student-specific information.

The student sign-in action redirected to the configured authentication portal, but the sandbox browser returned to a blank page before the provider selection could render. The protected workflow remains pending account authentication.

The core-member directory loaded successfully from the public community API. It displayed all 20 supplied roster entries, including Sarang Chakole as Group Leader and the Technical, Design & Content, Operational, Marketing & PR, and Event teams. The visible filter controls correctly exposed each of those teams.

The Technical Team filter was exercised in the live interface and reduced the roster to the four expected entries: Faiz Shaikh, Neeraj Khapre, Devanshu Kindarlaey, and Nevidita Nandurkar. The project also passed TypeScript checks, five Vitest tests, and a production build after the member update.

The published domain returned the expected page title but only displayed the hosting badge in the browser during this validation attempt. Further production-log inspection is needed before using the public deployment for account-specific workflow verification.

After clearing the stale browser cache and reopening the published domain with a fresh URL, the full AWS Community page rendered correctly, including the 20-person core-member directory, filters, events, noticeboard, and enquiry action.

The updated directory now opens a clickable profile for each member. The Sarang Chakole profile was verified with Branch, Year, USN, LinkedIn, and Contact Number fields visibly present but safely marked “Not publicly listed” until an authorised, consent-approved roster is imported.

The database confirms that all 20 current profiles have their academic, LinkedIn, and contact visibility flags set to zero. The admin-only import endpoint and import documentation are ready for an authorised roster that supplies details and member-specific public-display consent.

The signed-in student dashboard displayed one saved event registration. The profile deep link was checked through open and close states: closing removes the `member` parameter and returns to the roster without reopening. The profile grid has a single-column mobile breakpoint, preserving every privacy state on narrow layouts.

With user approval, the live signed-in registration flow was exercised for the Cloud Foundations Study Circle. The confirmation dialog showed a saving state and then the success message “Your event registration has been saved.” The signed-in activity count refreshed from 1 to 2, confirming the registration was persisted.

The member directory now exposes an “Add or update my details” action inside every profile. It correctly redirects unsigned visitors to student sign-in. Signed-in submissions are stored in a pending review queue with an acknowledgement and individual consent settings for academic details, LinkedIn, and contact number. Only an administrator can approve a submission; approval copies the submitted data to the public profile using those exact consent choices. TypeScript checks, nine Vitest tests, and a production build passed at this stage.

The self-service workflow now requires a one-to-one member-profile claim for non-administrator users. The protected API rejects unverified or mismatched member claims, while administrators may assist through the same reviewed process. A user-authorised Neeraj Khapre submission was saved as pending, verified to remain non-public while awaiting review, and then approved after explicit confirmation. The public profile was rechecked: it shows only the fields the user authorised, while the empty LinkedIn field remains “Not publicly listed.” The review queue now refreshes immediately after submissions. TypeScript checks, eleven Vitest tests, and a production build passed.
