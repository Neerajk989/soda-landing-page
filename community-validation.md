# Community Website Validation

The new public AWS Community at S.B. Jain website was opened successfully in the browser. Its public navigation, programme overview, sessions feed, noticeboard, institutional link, and enquiry action were visible. The mobile viewport also retained the full information hierarchy and did not show horizontal overflow.

Authenticated event registration and Student Builder Program submission are protected by the existing student sign-in flow. The public interface presents the sign-in state before a user can submit student-specific information.

The student sign-in action redirected to the configured authentication portal, but the sandbox browser returned to a blank page before the provider selection could render. The protected workflow remains pending account authentication.

The core-member directory loaded successfully from the public community API. It displayed all 20 supplied roster entries, including Sarang Chakole as Group Leader and the Technical, Design & Content, Operational, Marketing & PR, and Event teams. The visible filter controls correctly exposed each of those teams.

The Technical Team filter was exercised in the live interface and reduced the roster to the four expected entries: Faiz Shaikh, Neeraj Khapre, Devanshu Kindarlaey, and Nevidita Nandurkar. The project also passed TypeScript checks, five Vitest tests, and a production build after the member update.
